import { supabase } from '../lib/supabase';
import { Invoice, InvoiceItem } from '../types';
import { decreaseStock } from './inventoryService';

/**
 * Calculate invoice totals from items
 */
function calculateTotals(
  items: Partial<InvoiceItem>[],
  shippingFee: number = 0,
  extraFees: number = 0
): {
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingFee: number;
  extraFees: number;
  total: number;
} {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0),
    0
  );

  const discountTotal = items.reduce((sum, item) => sum + (item.discount || 0), 0);

  const taxTotal = items.reduce((sum, item) => {
    const itemSubtotal = (item.quantity || 0) * (item.unit_price || 0) - (item.discount || 0);
    const itemTax = (itemSubtotal * (item.tax_rate || 0)) / 100;
    return sum + itemTax;
  }, 0);

  const total = subtotal - discountTotal + taxTotal + (shippingFee || 0) + (extraFees || 0);

  return { subtotal, taxTotal, discountTotal, shippingFee: shippingFee || 0, extraFees: extraFees || 0, total };
}

/**
 * Get all invoices for the current business
 */
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!business) return [];

    const { data, error } = await supabase
      .from('invoices')
      .select('*, customer:customers(*), items:invoice_items(*, product:products(*))')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Invoice[];
  } catch (error) {
    console.error('Error getting invoices:', error);
    throw error;
  }
}

/**
 * Get invoices with filters
 */
export async function getInvoicesFiltered(filters: {
  status?: string;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<Invoice[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!business) return [];

    let query = supabase
      .from('invoices')
      .select('*, customer:customers(*), items:invoice_items(*, product:products(*))')
      .eq('business_id', business.id);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    if (filters.fromDate) {
      query = query.gte('issue_date', filters.fromDate);
    }

    if (filters.toDate) {
      query = query.lte('issue_date', filters.toDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Invoice[];
  } catch (error) {
    console.error('Error getting filtered invoices:', error);
    throw error;
  }
}

/**
 * Get a single invoice by ID with all related data
 */
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(
        '*, customer:customers(*), items:invoice_items(*, product:products(*))'
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Invoice;
  } catch (error) {
    console.error('Error getting invoice:', error);
    throw error;
  }
}

/**
 * Create a new invoice
 */
export async function createInvoice(
  invoiceData: {
    customer_id?: string;
    issue_date: string;
    due_date: string;
    status?: string;
    currency?: string;
    notes?: string;
    terms?: string;
    shipping_fee?: number;
    extra_fees?: number;
    items: Partial<InvoiceItem>[];
  }
): Promise<Invoice> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data: business } = await supabase
      .from('businesses')
      .select('id, invoice_prefix, auto_numbering, next_invoice_number')
      .eq('user_id', user.id)
      .single();

    if (!business) throw new Error('Business not found');

    // Calculate totals
    const { subtotal, taxTotal, discountTotal, shippingFee, extraFees, total } = calculateTotals(
      invoiceData.items,
      invoiceData.shipping_fee || 0,
      invoiceData.extra_fees || 0
    );

    // Generate invoice number
    let invoiceNumber: string;
    if (business.auto_numbering && business.next_invoice_number) {
      invoiceNumber = `${business.invoice_prefix || 'INV'}-${String(business.next_invoice_number).padStart(4, '0')}`;
      // Update next invoice number
      await supabase
        .from('businesses')
        .update({ next_invoice_number: business.next_invoice_number + 1 })
        .eq('id', business.id);
    } else {
      // Fallback to count-based numbering
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id);
      invoiceNumber = `${business.invoice_prefix || 'INV'}-${String((count || 0) + 1).padStart(4, '0')}`;
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        business_id: business.id,
        customer_id: invoiceData.customer_id || null,
        invoice_number: invoiceNumber,
        status: invoiceData.status || 'draft',
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date,
        currency: invoiceData.currency || 'USD',
        subtotal,
        tax_total: taxTotal,
        discount_total: discountTotal,
        shipping_fee: shippingFee,
        extra_fees: extraFees,
        total,
        paid_amount: 0,
        balance: total,
        notes: invoiceData.notes,
        terms: invoiceData.terms,
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

      // Create invoice items
      if (invoiceData.items.length > 0) {
        const itemsToInsert = invoiceData.items.map((item, index) => {
          const itemSubtotal = (item.quantity || 0) * (item.unit_price || 0);
          const itemDiscount = item.discount || 0;
          const itemTax = ((itemSubtotal - itemDiscount) * (item.tax_rate || 0)) / 100;
          const lineTotal = itemSubtotal - itemDiscount + itemTax;

          return {
            invoice_id: invoice.id,
            product_id: item.product_id || null,
            name: item.name || '',
            description: item.description,
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            tax_rate: item.tax_rate || 0,
            discount: item.discount || 0,
            line_total: lineTotal,
            sort_order: index,
          };
        });

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        // Decrease stock for products (only if invoice is not draft)
        if (invoiceData.status !== 'draft') {
          for (const item of invoiceData.items) {
            if (item.product_id && item.quantity) {
              try {
                await decreaseStock(item.product_id, item.quantity);
              } catch (error) {
                console.error(`Error decreasing stock for product ${item.product_id}:`, error);
                // Don't throw - stock update failure shouldn't block invoice creation
              }
            }
          }
        }
      }

    // Fetch complete invoice with relations
    return getInvoiceById(invoice.id) as Promise<Invoice>;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

/**
 * Update an invoice
 */
export async function updateInvoice(
  id: string,
  updates: {
    customer_id?: string;
    issue_date?: string;
    due_date?: string;
    status?: string;
    currency?: string;
    notes?: string;
    terms?: string;
    shipping_fee?: number;
    extra_fees?: number;
    items?: Partial<InvoiceItem>[];
  }
): Promise<Invoice> {
  try {
    // Get current invoice to preserve shipping_fee and extra_fees if not provided
    const { data: currentInvoice } = await supabase
      .from('invoices')
      .select('paid_amount, shipping_fee, extra_fees')
      .eq('id', id)
      .single();

    const shippingFee = updates.shipping_fee !== undefined ? (updates.shipping_fee || 0) : (currentInvoice?.shipping_fee || 0);
    const extraFees = updates.extra_fees !== undefined ? (updates.extra_fees || 0) : (currentInvoice?.extra_fees || 0);

    // If items are being updated, recalculate totals
    if (updates.items) {
      const { subtotal, taxTotal, discountTotal, shippingFee: calcShipping, extraFees: calcExtra, total } = calculateTotals(
        updates.items,
        shippingFee,
        extraFees
      );

      const paidAmount = currentInvoice?.paid_amount || 0;
      const balance = total - paidAmount;

      // Update invoice totals (exclude items from updates as it's not a column)
      const { items: _, ...invoiceUpdates } = updates;
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          ...invoiceUpdates,
          subtotal,
          tax_total: taxTotal,
          discount_total: discountTotal,
          shipping_fee: calcShipping,
          extra_fees: calcExtra,
          total,
          balance,
        })
        .eq('id', id);

      if (invoiceError) throw invoiceError;

      // Update items
      // Delete existing items
      await supabase.from('invoice_items').delete().eq('invoice_id', id);

      // Insert new items
      if (updates.items.length > 0) {
        const itemsToInsert = updates.items.map((item, index) => {
          const itemSubtotal = (item.quantity || 0) * (item.unit_price || 0);
          const itemDiscount = item.discount || 0;
          const itemTax = ((itemSubtotal - itemDiscount) * (item.tax_rate || 0)) / 100;
          const lineTotal = itemSubtotal - itemDiscount + itemTax;

          return {
            invoice_id: id,
            product_id: item.product_id || null,
            name: item.name || '',
            description: item.description,
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            tax_rate: item.tax_rate || 0,
            discount: item.discount || 0,
            line_total: lineTotal,
            sort_order: index,
          };
        });

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }
    } else {
      // Just update invoice fields, but recalculate total if shipping/extra fees changed
      const { items: _, shipping_fee: updateShipping, extra_fees: updateExtra, ...otherUpdates } = updates;
      
      if (updateShipping !== undefined || updateExtra !== undefined) {
        // Need to recalculate total with new shipping/extra fees
        const { data: invoice } = await supabase
          .from('invoices')
          .select('subtotal, tax_total, discount_total')
          .eq('id', id)
          .single();
        
        if (invoice) {
          const finalShipping = updateShipping !== undefined ? (updateShipping || 0) : shippingFee;
          const finalExtra = updateExtra !== undefined ? (updateExtra || 0) : extraFees;
          const newTotal = invoice.subtotal - invoice.discount_total + invoice.tax_total + finalShipping + finalExtra;
          const { data: currentInvoice } = await supabase
            .from('invoices')
            .select('paid_amount')
            .eq('id', id)
            .single();
          const balance = newTotal - (currentInvoice?.paid_amount || 0);
          
          const { error } = await supabase
            .from('invoices')
            .update({
              ...otherUpdates,
              shipping_fee: finalShipping,
              extra_fees: finalExtra,
              total: newTotal,
              balance,
            })
            .eq('id', id);
          
          if (error) throw error;
        }
      } else {
        // Just update other fields
        const { error } = await supabase
          .from('invoices')
          .update(otherUpdates)
          .eq('id', id);

        if (error) throw error;
      }
    }

    // Update status based on dates and payments
    await updateInvoiceStatus(id);

    return getInvoiceById(id) as Promise<Invoice>;
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
}

/**
 * Update invoice status based on dates and payments
 */
export async function updateInvoiceStatus(invoiceId: string): Promise<void> {
  try {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('status, due_date, total, paid_amount, balance')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) throw invoiceError;
    if (!invoice) return;

    let newStatus = invoice.status;

    // Check if fully paid
    if (invoice.balance <= 0 && invoice.paid_amount > 0) {
      newStatus = 'paid';
    } else if (invoice.paid_amount > 0 && invoice.balance > 0) {
      newStatus = 'partial';
    } else if (invoice.status === 'sent') {
      // Check if overdue
      const today = new Date();
      const dueDate = new Date(invoice.due_date);
      if (dueDate < today) {
        newStatus = 'overdue';
      }
    }

    // Only update if status changed
    if (newStatus !== invoice.status) {
      await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId);
    }
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }
}

/**
 * Delete an invoice
 */
export async function deleteInvoice(id: string): Promise<void> {
  try {
    // Delete items first (cascade should handle this, but being explicit)
    await supabase.from('invoice_items').delete().eq('invoice_id', id);
    await supabase.from('payments').delete().eq('invoice_id', id);
    await supabase.from('invoices').delete().eq('id', id);
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}

/**
 * Duplicate an invoice
 */
export async function duplicateInvoice(id: string): Promise<Invoice> {
  try {
    const invoice = await getInvoiceById(id);
    if (!invoice) throw new Error('Invoice not found');

    const { data: business } = await supabase
      .from('businesses')
      .select('id, invoice_prefix')
      .eq('id', invoice.business_id)
      .single();

    if (!business) throw new Error('Business not found');

    // Generate new invoice number (unused - invoice number is generated in createInvoice)
    // const { count } = await supabase
    //   .from('invoices')
    //   .select('*', { count: 'exact', head: true })
    //   .eq('business_id', business.id);

    // Create new invoice with same data
    const newInvoice = await createInvoice({
      customer_id: invoice.customer_id || undefined,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: invoice.due_date,
      status: 'draft',
      currency: invoice.currency,
      notes: invoice.notes || undefined,
      terms: invoice.terms || undefined,
      items: (invoice.items || []).map((item) => ({
        product_id: item.product_id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        discount: item.discount,
      })),
    });

    return newInvoice;
  } catch (error) {
    console.error('Error duplicating invoice:', error);
    throw error;
  }
}


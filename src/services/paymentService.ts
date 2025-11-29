import { supabase } from '../lib/supabase';
import { Payment } from '../types';
import { updateInvoiceStatus } from './invoiceService';

/**
 * Get all payments for an invoice
 */
export async function getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting payments:', error);
    throw error;
  }
}

/**
 * Add a payment to an invoice
 */
export async function addPayment(
  invoiceId: string,
  paymentData: {
    amount: number;
    payment_date: string;
    payment_method: Payment['payment_method'];
    reference?: string;
    notes?: string;
  }
): Promise<Payment> {
  try {
    // Create payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        amount: paymentData.amount,
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        reference: paymentData.reference,
        notes: paymentData.notes,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Recalculate invoice totals
    await recalculateInvoiceTotals(invoiceId);

    // Update invoice status
    await updateInvoiceStatus(invoiceId);

    return payment;
  } catch (error) {
    console.error('Error adding payment:', error);
    throw error;
  }
}

/**
 * Recalculate invoice paid amount and balance
 */
export async function recalculateInvoiceTotals(invoiceId: string): Promise<void> {
  try {
    // Get all payments for this invoice
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoiceId);

    if (paymentsError) throw paymentsError;

    const paidAmount = (payments || []).reduce((sum, p) => sum + p.amount, 0);

    // Get invoice total
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('total')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) throw invoiceError;

    const balance = invoice.total - paidAmount;

    // Update invoice
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        paid_amount: paidAmount,
        balance: balance,
      })
      .eq('id', invoiceId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error recalculating invoice totals:', error);
    throw error;
  }
}

/**
 * Update a payment
 */
export async function updatePayment(
  id: string,
  updates: Partial<Omit<Payment, 'id' | 'invoice_id' | 'created_at' | 'updated_at'>>
): Promise<Payment> {
  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Recalculate invoice totals
    if (payment) {
      await recalculateInvoiceTotals(payment.invoice_id);
      await updateInvoiceStatus(payment.invoice_id);
    }

    return payment;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
}

/**
 * Delete a payment
 */
export async function deletePayment(id: string): Promise<void> {
  try {
    // Get payment to know which invoice to update
    const { data: payment, error: getError } = await supabase
      .from('payments')
      .select('invoice_id')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    // Delete payment
    const { error: deleteError } = await supabase.from('payments').delete().eq('id', id);

    if (deleteError) throw deleteError;

    // Recalculate invoice totals
    if (payment) {
      await recalculateInvoiceTotals(payment.invoice_id);
      await updateInvoiceStatus(payment.invoice_id);
    }
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
}


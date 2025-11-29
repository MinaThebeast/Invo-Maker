import { supabase } from '../lib/supabase';
import { Customer, Invoice } from '../types';

/**
 * Get all customers for the current business
 */
export async function getCustomers(): Promise<Customer[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (businessError) {
      console.error('Error fetching business:', businessError);
      return [];
    }

    if (!business) return [];

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
}

/**
 * Search customers by name, email, or phone
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
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
      .from('customers')
      .select('*')
      .eq('business_id', business.id)
      .or(
        `name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`
      )
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
}

/**
 * Get a single customer by ID
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
}

/**
 * Get customer with invoice history
 */
export async function getCustomerWithInvoices(
  id: string
): Promise<{ customer: Customer; invoices: Invoice[] } | null> {
  try {
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (customerError) throw customerError;
    if (!customer) return null;

    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false });

    if (invoicesError) throw invoicesError;

    return {
      customer,
      invoices: invoices || [],
    };
  } catch (error) {
    console.error('Error getting customer with invoices:', error);
    throw error;
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(
  customerData: Omit<Customer, 'id' | 'business_id' | 'created_at' | 'updated_at'>
): Promise<Customer> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    let { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    // If business doesn't exist, create a default one
    if (!business) {
      const { data: newBusiness, error: createError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: 'My Business',
          email: user.email || '',
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating business:', createError);
        throw new Error('Please set up your business profile first in Settings.');
      }
      business = newBusiness;
    }

    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...customerData,
        business_id: business.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

/**
 * Update a customer
 */
export async function updateCustomer(
  id: string,
  updates: Partial<Omit<Customer, 'id' | 'business_id' | 'created_at' | 'updated_at'>>
): Promise<Customer> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}


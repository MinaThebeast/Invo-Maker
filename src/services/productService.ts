import { supabase } from '../lib/supabase';
import { Product } from '../types';

/**
 * Get all products for the current business
 */
export async function getProducts(includeInactive: boolean = false): Promise<Product[]> {
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
      .from('products')
      .select('*')
      .eq('business_id', business.id);

    if (!includeInactive) {
      query = query.eq('active', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
}

/**
 * Search products by name, SKU, or barcode
 */
export async function searchProducts(query: string): Promise<Product[]> {
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
      .from('products')
      .select('*')
      .eq('business_id', business.id)
      .eq('active', true)
      .or(
        `name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%`
      )
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

/**
 * Get product by barcode
 */
export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!business) return null;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', business.id)
      .eq('barcode', barcode)
      .eq('active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error getting product by barcode:', error);
    throw error;
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
}

/**
 * Create a new product
 */
export async function createProduct(
  productData: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>
): Promise<Product> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!business) throw new Error('Business not found');

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        business_id: business.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

/**
 * Update a product
 */
export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>>
): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

/**
 * Delete a product (soft delete by setting active to false)
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}


import { supabase } from '../lib/supabase';
import { Product } from '../types';

/**
 * Decrease stock quantity when product is invoiced
 */
export async function decreaseStock(productId: string, quantity: number): Promise<void> {
  try {
    const { data: product, error: getError } = await supabase
      .from('products')
      .select('stock_qty')
      .eq('id', productId)
      .single();

    if (getError) throw getError;
    if (!product) throw new Error('Product not found');

    const newStock = (product.stock_qty || 0) - quantity;

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_qty: Math.max(0, newStock) })
      .eq('id', productId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error decreasing stock:', error);
    throw error;
  }
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(threshold: number = 10): Promise<Product[]> {
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
      .not('stock_qty', 'is', null)
      .lte('stock_qty', threshold)
      .order('stock_qty', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting low stock products:', error);
    throw error;
  }
}

/**
 * Get AI alert for low stock products
 */
export async function getLowStockAlert(products: Product[]): Promise<string> {
  if (products.length === 0) return '';

  const productList = products
    .map((p) => `${p.name} (${p.stock_qty} ${p.unit} remaining)`)
    .join(', ');

  // Simple alert - could use AI for more sophisticated messaging
  return `⚠️ Low Stock Alert: ${products.length} product${products.length > 1 ? 's' : ''} running low: ${productList}`;
}


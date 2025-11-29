import { supabase } from '../lib/supabase';
import { Business } from '../types';

/**
 * Get the current user's business
 */
export async function getBusiness(): Promise<Business | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting business:', error);
    throw error;
  }
}

/**
 * Update business profile
 */
export async function updateBusiness(
  updates: Partial<Omit<Business, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Business> {
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
      .from('businesses')
      .update(updates)
      .eq('id', business.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating business:', error);
    throw error;
  }
}

/**
 * Create business (usually called during registration)
 */
export async function createBusiness(
  businessData: Omit<Business, 'id' | 'created_at' | 'updated_at'>
): Promise<Business> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Ensure user record exists in public.users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!existingUser) {
      // Create user record if it doesn't exist
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url,
        });

      if (userError) {
        console.warn('Could not create user record:', userError);
        // Continue anyway - the foreign key might reference auth.users directly
      }
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        ...businessData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      // If foreign key error, try to provide helpful message
      if (error.code === '23503') {
        throw new Error('Database configuration issue. Please run the database migrations. See MIGRATION_INSTRUCTIONS.md');
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating business:', error);
    throw error;
  }
}


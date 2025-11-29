import { supabase } from '../lib/supabase';

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Upload product image
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}-${Date.now()}.${fileExt}`;
  return await uploadFile(file, 'product-images', fileName);
}

/**
 * Upload business logo
 */
export async function uploadBusinessLogo(
  file: File,
  businessId: string
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${businessId}-${Date.now()}.${fileExt}`;
  return await uploadFile(file, 'business-logos', fileName);
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}


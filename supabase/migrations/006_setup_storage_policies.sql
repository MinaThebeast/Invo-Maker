-- Setup Storage RLS Policies for product-images and business-logos buckets
-- These policies allow authenticated users to upload, read, update, and delete their own files
--
-- NOTE: This migration may fail with permission errors. If so, please set up policies
-- through the Supabase Dashboard instead (see STORAGE_POLICIES_SETUP.md)
--
-- To run this migration, you may need service role permissions or run it through
-- the Supabase Dashboard's SQL Editor with elevated privileges.

-- Enable RLS on storage.objects if not already enabled
-- Note: This may require superuser permissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policies for product-images bucket
-- Drop existing policies if they exist (to allow re-running this migration)
DROP POLICY IF EXISTS "Users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their product images" ON storage.objects;

-- Allow authenticated users to upload product images
CREATE POLICY "Users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to read product images
CREATE POLICY "Users can read product images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users to update their product images
CREATE POLICY "Users can update their product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to delete their product images
CREATE POLICY "Users can delete their product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Policies for business-logos bucket
-- Drop existing policies if they exist (to allow re-running this migration)
DROP POLICY IF EXISTS "Users can upload business logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read business logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their business logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their business logos" ON storage.objects;

-- Allow authenticated users to upload business logos
CREATE POLICY "Users can upload business logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-logos');

-- Allow authenticated users to read business logos
CREATE POLICY "Users can read business logos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'business-logos');

-- Allow authenticated users to update their business logos
CREATE POLICY "Users can update their business logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-logos')
WITH CHECK (bucket_id = 'business-logos');

-- Allow authenticated users to delete their business logos
CREATE POLICY "Users can delete their business logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-logos');


-- Add image_url column to products table
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS image_url TEXT;


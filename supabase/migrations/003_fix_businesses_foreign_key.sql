-- Fix foreign key constraint for businesses table
-- The user_id should reference auth.users directly, not public.users
-- This ensures businesses can be created even if the user doesn't have a public.users record yet

-- Drop the existing foreign key constraint if it exists
ALTER TABLE IF EXISTS public.businesses
  DROP CONSTRAINT IF EXISTS businesses_user_id_fkey;

-- Add the correct foreign key constraint referencing auth.users
ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;


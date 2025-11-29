-- Fix: Add missing INSERT policy for users table
-- This allows new users to create their profile during registration
-- This migration is idempotent - safe to run multiple times

-- Drop policy if it exists (in case it was created manually)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create the INSERT policy
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);


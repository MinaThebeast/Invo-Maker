-- Add stripe_customer_id column to users table for subscription management
ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);

-- Add comment
COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe customer ID for subscription management';


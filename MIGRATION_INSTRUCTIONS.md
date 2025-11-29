# Database Migration Instructions

## Issue
The `businesses` table has a foreign key constraint that references `public.users`, but users might not have a record in `public.users` when they sign up, causing errors when creating a business.

## Solution
Two migrations have been created to fix this:

1. **003_fix_businesses_foreign_key.sql** - Changes the foreign key to reference `auth.users` directly
2. **004_create_user_on_signup.sql** - Creates a trigger to automatically create a `public.users` record when a user signs up

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/003_fix_businesses_foreign_key.sql`
4. Click **Run**
5. Copy and paste the contents of `supabase/migrations/004_create_user_on_signup.sql`
6. Click **Run**

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Manual SQL Execution

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Migration 003: Fix foreign key
ALTER TABLE IF EXISTS public.businesses
  DROP CONSTRAINT IF EXISTS businesses_user_id_fkey;

ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Migration 004: Auto-create user records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = NEW.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## After Running Migrations

1. Try creating a business profile in Settings again
2. The error should be resolved
3. New users will automatically get a `public.users` record when they sign up

## Verification

To verify the migrations worked:

```sql
-- Check foreign key constraint
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conname = 'businesses_user_id_fkey';

-- Check trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```


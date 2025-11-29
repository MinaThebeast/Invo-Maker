# Supabase Storage Setup

To enable image uploads for products and business logos, you need to set up storage buckets in Supabase.

## Steps

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Create two storage buckets:

### 1. Product Images Bucket
- **Bucket name**: `product-images`
- **Public bucket**: ✅ Yes (checked)
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

### 2. Business Logos Bucket
- **Bucket name**: `business-logos`
- **Public bucket**: ✅ Yes (checked)
- **File size limit**: 2 MB
- **Allowed MIME types**: `image/jpeg, image/png, image/svg+xml, image/webp`

## Storage Policies

After creating the buckets, you need to set up Row Level Security (RLS) policies. **The easiest way is through the Supabase Dashboard:**

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to **Storage** → **Policies** in your Supabase dashboard
2. For each bucket (`product-images` and `business-logos`), click **"New Policy"**
3. Create the following policies for each bucket:

#### For `product-images` bucket:

**Policy 1: Allow uploads**
- Policy name: "Users can upload product images"
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'product-images'`
- WITH CHECK expression: `bucket_id = 'product-images'`

**Policy 2: Allow reads**
- Policy name: "Users can read product images"
- Allowed operation: `SELECT`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'product-images'`

**Policy 3: Allow updates**
- Policy name: "Users can update their product images"
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'product-images'`
- WITH CHECK expression: `bucket_id = 'product-images'`

**Policy 4: Allow deletes**
- Policy name: "Users can delete their product images"
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'product-images'`

#### For `business-logos` bucket:

Repeat the same 4 policies but replace:
- Policy names: "Users can upload/read/update/delete business logos"
- Bucket ID: `'business-logos'`

### Method 2: Using SQL (Alternative)

If you have service role access, you can run the SQL migration. However, **the dashboard method is recommended** as it's simpler and doesn't require special permissions.

## Running the Migrations

### 1. Add image_url column to products:
```sql
-- Run this in Supabase SQL Editor
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS image_url TEXT;
```

Or run the migration file: `supabase/migrations/005_add_product_image.sql`

### 2. Set up Storage RLS Policies:
**IMPORTANT**: You must run the storage policies migration for file uploads to work!

Run the migration file: `supabase/migrations/006_setup_storage_policies.sql`

Or manually run the SQL in the Supabase SQL Editor. This migration sets up Row Level Security policies that allow authenticated users to upload, read, update, and delete files in the storage buckets.


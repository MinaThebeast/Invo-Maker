# Quick Guide: Setting Up Storage Policies in Supabase Dashboard

Since SQL approach requires special permissions, here's the easiest way to set up storage policies:

## Step-by-Step Instructions

### 1. Navigate to Storage Policies

1. Go to your Supabase project dashboard
2. Click on **Storage** in the left sidebar
3. Click on **Policies** tab (or go directly to a bucket and click "Policies")

### 2. Set Up Policies for `product-images` Bucket

1. Find or select the `product-images` bucket
2. Click **"New Policy"** or **"Add Policy"**

Create these 4 policies:

#### Policy 1: Upload (INSERT)
- **Policy name**: `Users can upload product images`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'product-images'`
- **WITH CHECK expression**: `bucket_id = 'product-images'`

#### Policy 2: Read (SELECT)
- **Policy name**: `Users can read product images`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'product-images'`

#### Policy 3: Update (UPDATE)
- **Policy name**: `Users can update their product images`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'product-images'`
- **WITH CHECK expression**: `bucket_id = 'product-images'`

#### Policy 4: Delete (DELETE)
- **Policy name**: `Users can delete their product images`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'product-images'`

### 3. Set Up Policies for `business-logos` Bucket

Repeat the same 4 policies for the `business-logos` bucket, but:
- Change policy names to include "business logos" instead of "product images"
- Change bucket_id to `'business-logos'`

## Quick Copy-Paste Expressions

If the dashboard has a template editor, you can use these:

**For INSERT policy:**
```sql
bucket_id = 'product-images'
```

**For SELECT/UPDATE/DELETE policies:**
```sql
bucket_id = 'product-images'
```

(Replace `'product-images'` with `'business-logos'` for logo bucket)

## Verification

After setting up policies, try uploading a logo or product image in your app. It should work without the RLS error!


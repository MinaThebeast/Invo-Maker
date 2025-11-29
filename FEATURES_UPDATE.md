# Features Update - Email, SMS, Images, and Logo

This document outlines the new features and fixes implemented.

## 1. Email Improvements ✅

### Fixed Issues:
- **AI-generated content now included in mailto links**: The `sendInvoiceEmailFallback` function now accepts and uses the AI-generated subject and body from the `AIEmailDraft` component.
- **Company signature added**: Email signatures now automatically include:
  - Company name
  - Phone number (if available)
  - Email address (if available)
  - Website (if available)

### Changes Made:
- Updated `src/services/emailService.ts`:
  - `sendInvoiceEmailFallback` now accepts `subject` and `body` parameters
  - Automatically fetches business information for signature
  - Includes all business contact details in the email signature

- Updated `src/pages/InvoiceDetail.tsx`:
  - `handleEmailSend` now passes AI-generated content to the fallback function

## 2. SMS/Text Message Support ✅

### New Feature:
- Added ability to send invoice notifications via SMS/text message
- Works on mobile devices using `sms:` protocol
- Falls back to displaying message on desktop for manual sending

### Files Created:
- `src/services/smsService.ts`: Service for sending SMS messages

### Changes Made:
- Updated `src/pages/InvoiceDetail.tsx`:
  - Added "Send SMS" button next to "Send Email"
  - Button is disabled if customer doesn't have a phone number
  - Uses `MessageSquare` icon from lucide-react

## 3. Product Image Upload ✅

### New Feature:
- Users can now upload images for products
- Images are stored in Supabase Storage
- Preview shown before saving
- Images displayed in product list view

### Files Created:
- `src/services/storageService.ts`: Service for file uploads to Supabase Storage
- `supabase/migrations/005_add_product_image.sql`: Migration to add `image_url` column

### Changes Made:
- Updated `src/types/index.ts`: Added `image_url?: string` to `Product` interface
- Updated `src/pages/ProductForm.tsx`:
  - Added image upload UI with preview
  - File validation (image types, max 5MB)
  - Remove image functionality
- Updated `src/pages/Products.tsx`: Display product images in the grid view

## 4. Business Logo Upload ✅

### Fixed Issue:
- Logo upload section was disabled/grayed out
- Now fully functional with upload, preview, and remove capabilities

### Changes Made:
- Updated `src/pages/Settings.tsx`:
  - Enabled logo upload functionality
  - Added file input with preview
  - File validation (image types, max 2MB)
  - Remove logo functionality
  - Uses `uploadBusinessLogo` from storage service

## Setup Required

### 1. Run Database Migration
Execute the migration to add the `image_url` column to products:
```sql
-- Run in Supabase SQL Editor
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS image_url TEXT;
```

Or run: `supabase/migrations/005_add_product_image.sql`

### 2. Set Up Supabase Storage Buckets
See `STORAGE_SETUP.md` for detailed instructions on:
- Creating storage buckets (`product-images` and `business-logos`)
- Setting up RLS policies for secure access

### Quick Setup:
1. Go to Supabase Dashboard → Storage
2. Create bucket: `product-images` (public, 5MB limit)
3. Create bucket: `business-logos` (public, 2MB limit)
4. Set up RLS policies (see `STORAGE_SETUP.md`)

## Testing Checklist

- [ ] Email: Send invoice email and verify AI content is included
- [ ] Email: Verify company signature appears in email
- [ ] SMS: Test SMS sending on mobile device
- [ ] Product Images: Upload product image and verify it displays
- [ ] Product Images: Verify image appears in product list
- [ ] Logo: Upload business logo in Settings
- [ ] Logo: Verify logo can be removed and changed

## Notes

- Image uploads require Supabase Storage to be configured
- SMS functionality works best on mobile devices
- Email fallback (mailto) works on all platforms but requires user's email client
- All file uploads include validation for type and size


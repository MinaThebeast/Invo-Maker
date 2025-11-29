-- Add shipping_fee and extra_fees to invoices table
ALTER TABLE IF EXISTS public.invoices
  ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS extra_fees DECIMAL(10,2) DEFAULT 0.00;

-- Add invoice number settings to businesses table
ALTER TABLE IF EXISTS public.businesses
  ADD COLUMN IF NOT EXISTS auto_numbering BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS next_invoice_number INTEGER DEFAULT 1;

-- Update invoice_prefix default if needed
-- (already exists in schema, but ensure it's set)


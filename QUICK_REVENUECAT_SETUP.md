# Quick RevenueCat Setup Guide

## Prerequisites Check

✅ Supabase CLI is already installed (you can skip the install step)

## Step-by-Step Activation

### Step 1: Login to Supabase CLI

```bash
supabase login
```

This will open your browser to authenticate.

### Step 2: Link Your Project

```bash
supabase link --project-ref your-project-ref
```

To find your project ref:
1. Go to Supabase Dashboard
2. Go to Settings → General
3. Copy the "Reference ID"

### Step 3: Run Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/migrations/008_add_stripe_customer_id.sql`:
   ```sql
   ALTER TABLE IF EXISTS public.users
   ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
   
   CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
   
   COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe customer ID for subscription management';
   ```
3. Click "Run"

### Step 4: Set Up Stripe

1. **Create Stripe Account** (if you don't have one):
   - Go to [stripe.com](https://stripe.com)
   - Sign up and complete verification

2. **Get Stripe API Keys**:
   - Dashboard → Developers → API keys
   - Copy **Secret key** (starts with `sk_test_` for testing or `sk_live_` for production)

3. **Create Products**:
   - Go to Products → Add Product
   - **INVO Maker Pro**:
     - Name: INVO Maker Pro
     - Pricing: $4.99/month (recurring)
     - Copy the **Price ID** (starts with `price_`)
   - **INVO Maker Gold**:
     - Name: INVO Maker Gold
     - Pricing: $11.99/month (recurring)
     - Copy the **Price ID** (starts with `price_`)

### Step 5: Set Up RevenueCat

1. **Create RevenueCat Account** (if you don't have one):
   - Go to [revenuecat.com](https://revenuecat.com)
   - Sign up and create a project: "INVO Maker"

2. **Configure Products**:
   - Products → Add Product
   - **Product 1**:
     - Product ID: `invo_maker_pro`
     - Platform: Web
     - Connect Stripe
     - Link to your Stripe Pro price ID
   - **Product 2**:
     - Product ID: `invo_maker_gold`
     - Platform: Web
     - Connect Stripe
     - Link to your Stripe Gold price ID

3. **Create Entitlements**:
   - Entitlements → Add Entitlement
   - **Entitlement 1**:
     - Identifier: `pro`
     - Attach product: `invo_maker_pro`
   - **Entitlement 2**:
     - Identifier: `gold`
     - Attach product: `invo_maker_gold`

4. **Get API Key**:
   - Project Settings → API Keys
   - Copy **Public API Key** (starts with `rcb_`)

### Step 6: Set Supabase Secrets

```bash
# Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production

# Stripe Price IDs (from Step 4)
supabase secrets set STRIPE_PRICE_ID_PRO=price_...
supabase secrets set STRIPE_PRICE_ID_GOLD=price_...

# RevenueCat
supabase secrets set REVENUECAT_API_KEY=rcb_...
```

### Step 7: Deploy Edge Functions

```bash
# Deploy checkout function
supabase functions deploy create-checkout

# Deploy webhook handler (optional but recommended)
supabase functions deploy stripe-webhook
```

### Step 8: Update Frontend Environment

Add to your `.env` file:
```env
VITE_REVENUECAT_API_KEY=rcb_...
```

### Step 9: Test the Integration

1. Start dev server: `npm run dev`
2. Go to Settings → Subscription tab
3. Click "Subscribe" on Pro or Gold plan
4. You'll be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Complete checkout
7. You should be redirected back with success message

### Step 10: Set Up Stripe Webhook (Optional but Recommended)

1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** (starts with `whsec_`)
5. Set as secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Verification

After setup, verify:
- ✅ Subscription status updates in Settings → Subscription
- ✅ Usage limits reflect the new plan
- ✅ Customer appears in RevenueCat dashboard
- ✅ Subscription appears in Stripe dashboard

## Troubleshooting

**Function deployment fails:**
- Make sure you're logged in: `supabase login`
- Check project is linked: `supabase projects list`

**Checkout not working:**
- Verify all secrets are set: `supabase secrets list`
- Check function logs in Supabase Dashboard

**Subscription not updating:**
- Check RevenueCat dashboard for customer
- Verify entitlements are linked correctly
- Check browser console for errors

## Need Help?

See `REVENUECAT_ACTIVATION.md` for detailed instructions.


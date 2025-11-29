# RevenueCat Activation Guide

This guide will help you activate RevenueCat for subscription management in INVO Maker.

## Prerequisites

- Stripe account (for payment processing)
- RevenueCat account (for subscription management)
- Supabase project with Edge Functions enabled

## Step 1: Set Up Stripe

### 1.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification
3. Get your API keys from Dashboard → Developers → API keys

### 1.2 Create Products in Stripe
1. Go to Products → Add Product
2. Create **INVO Maker Pro**:
   - Name: INVO Maker Pro
   - Pricing: $4.99/month (recurring)
   - Copy the **Price ID** (starts with `price_`)
3. Create **INVO Maker Gold**:
   - Name: INVO Maker Gold
   - Pricing: $11.99/month (recurring)
   - Copy the **Price ID** (starts with `price_`)

### 1.3 Get Stripe Webhook Secret (Optional)
1. Go to Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** (starts with `whsec_`)

## Step 2: Set Up RevenueCat

### 2.1 Create RevenueCat Account
1. Go to [revenuecat.com](https://revenuecat.com) and create an account
2. Create a new project: "INVO Maker"

### 2.2 Configure Products
1. Go to Products → Add Product
2. Create **INVO Maker Pro**:
   - Product ID: `invo_maker_pro`
   - Platform: Web
   - Connect to Stripe
   - Link to your Stripe Pro price ID
3. Create **INVO Maker Gold**:
   - Product ID: `invo_maker_gold`
   - Platform: Web
   - Connect to Stripe
   - Link to your Stripe Gold price ID

### 2.3 Create Entitlements
1. Go to Entitlements → Add Entitlement
2. Create **pro** entitlement:
   - Identifier: `pro`
   - Attach product: `invo_maker_pro`
3. Create **gold** entitlement:
   - Identifier: `gold`
   - Attach product: `invo_maker_gold`

### 2.4 Get API Key
1. Go to Project Settings → API Keys
2. Copy your **Public API Key** (starts with `rcb_`)

## Step 3: Deploy Supabase Edge Functions

### 3.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 3.2 Login and Link Project
```bash
supabase login
supabase link --project-ref your-project-ref
```

### 3.3 Run Database Migration
1. In Supabase Dashboard → SQL Editor
2. Run the migration: `supabase/migrations/008_add_stripe_customer_id.sql`
   ```sql
   ALTER TABLE IF EXISTS public.users
   ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
   
   CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
   ```

### 3.4 Set Environment Variables
```bash
# Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_live_... # Use sk_test_... for testing

# Stripe Price IDs (from Step 1.2)
supabase secrets set STRIPE_PRICE_ID_PRO=price_...
supabase secrets set STRIPE_PRICE_ID_GOLD=price_...

# RevenueCat
supabase secrets set REVENUECAT_API_KEY=rcb_...

# Optional: Stripe Webhook Secret (from Step 1.3)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3.5 Deploy Functions
```bash
# Deploy checkout function
supabase functions deploy create-checkout

# Deploy webhook handler (optional)
supabase functions deploy stripe-webhook
```

## Step 4: Configure Frontend

### 4.1 Update Environment Variables
Add to your `.env` file:
```env
VITE_REVENUECAT_API_KEY=rcb_...
```

### 4.2 Test the Integration
1. Start your development server: `npm run dev`
2. Go to Settings → Subscription tab
3. Click "Subscribe" on Pro or Gold plan
4. You should be redirected to Stripe Checkout
5. Use Stripe test card: `4242 4242 4242 4242`
6. Complete the checkout
7. You should be redirected back with a success message

## Step 5: Verify Integration

### 5.1 Check Subscription Status
1. After successful checkout, go to Settings → Subscription
2. Your current plan should update to Pro or Gold
3. Usage limits should reflect the new plan

### 5.2 Verify in RevenueCat
1. Go to RevenueCat Dashboard → Customers
2. Search for your user ID
3. You should see the active entitlement

### 5.3 Verify in Stripe
1. Go to Stripe Dashboard → Customers
2. Find your customer
3. You should see the active subscription

## Troubleshooting

### Checkout Not Working
- Verify Stripe secret key is set correctly
- Check that Stripe price IDs are correct
- Ensure Edge Function is deployed
- Check browser console for errors

### Subscription Not Updating
- Verify RevenueCat API key is correct
- Check RevenueCat dashboard for customer
- Ensure entitlements are linked to products
- Check webhook is configured (if using webhooks)

### Webhook Not Working
- Verify webhook secret is set
- Check Stripe webhook endpoint is correct
- Ensure webhook events are selected
- Check Supabase function logs

## Testing

### Test Cards (Stripe)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

### Test Mode
- Use `sk_test_...` for Stripe
- Use RevenueCat sandbox mode
- Test subscriptions will not charge real money

## Production Checklist

- [ ] Switch to Stripe live keys (`sk_live_...`)
- [ ] Update Stripe price IDs to live prices
- [ ] Configure production webhook endpoint
- [ ] Test full subscription flow
- [ ] Verify RevenueCat entitlements work
- [ ] Set up monitoring/alerts
- [ ] Document support process

## Support

For issues:
1. Check Supabase function logs
2. Check Stripe dashboard for payment status
3. Check RevenueCat dashboard for entitlements
4. Review browser console for frontend errors


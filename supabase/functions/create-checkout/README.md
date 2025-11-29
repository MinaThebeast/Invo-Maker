# Create Checkout Edge Function

This Supabase Edge Function creates Stripe checkout sessions for subscriptions and integrates with RevenueCat.

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

### 4. Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create products:
   - **INVO Maker Pro**: $4.99/month recurring subscription
   - **INVO Maker Gold**: $11.99/month recurring subscription
3. Copy the Price IDs (starts with `price_`)

### 5. Set Up RevenueCat

1. Create a RevenueCat account at [revenuecat.com](https://revenuecat.com)
2. Create a project for INVO Maker
3. Create products:
   - **Product ID**: `invo_maker_pro` → Link to Stripe Pro price
   - **Product ID**: `invo_maker_gold` → Link to Stripe Gold price
4. Create entitlements:
   - **Entitlement**: `pro` → Link to `invo_maker_pro` product
   - **Entitlement**: `gold` → Link to `invo_maker_gold` product
5. Get your Public API Key (starts with `rcb_`)

### 6. Set Environment Variables

```bash
# Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing

# Stripe Price IDs (from step 4)
supabase secrets set STRIPE_PRICE_ID_PRO=price_...
supabase secrets set STRIPE_PRICE_ID_GOLD=price_...

# RevenueCat
supabase secrets set REVENUECAT_API_KEY=rcb_...

# Optional: Stripe Webhook Secret (for webhook handler)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### 7. Add Stripe Customer ID Column

Run this migration in your Supabase SQL Editor:

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
```

### 8. Deploy Function

```bash
supabase functions deploy create-checkout
```

## Usage

The function is called automatically when a user clicks "Subscribe" in the Subscription tab.

## Webhook Setup (Optional)

To automatically sync subscription status with RevenueCat, set up a Stripe webhook:

1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret and set as `STRIPE_WEBHOOK_SECRET`

## Testing

Test locally:

```bash
supabase functions serve create-checkout
```

Then test from your app or use the Supabase dashboard.


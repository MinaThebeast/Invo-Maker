# RevenueCat Subscription Setup Guide

This guide will help you set up RevenueCat for managing subscriptions in INVO Maker.

## Step 1: Create RevenueCat Account

1. Go to [RevenueCat](https://www.revenuecat.com/) and create an account
2. Create a new project for INVO Maker

## Step 2: Configure Products

In your RevenueCat dashboard, create the following products:

### Product 1: INVO Maker Pro
- **Product ID**: `invo_maker_pro`
- **Price**: $4.99/month
- **Platform**: Web (Stripe recommended)
- **Entitlement**: `pro`

### Product 2: INVO Maker Gold
- **Product ID**: `invo_maker_gold`
- **Price**: $11.99/month
- **Platform**: Web (Stripe recommended)
- **Entitlement**: `gold`

## Step 3: Set Up Entitlements

Create two entitlements in RevenueCat:

1. **`pro`** - For Pro plan subscribers
2. **`gold`** - For Gold plan subscribers

Link each entitlement to its corresponding product.

## Step 4: Configure Stripe (Recommended for Web)

1. Connect your Stripe account to RevenueCat
2. Create products in Stripe:
   - INVO Maker Pro: $4.99/month recurring
   - INVO Maker Gold: $11.99/month recurring
3. Link Stripe products to RevenueCat products

## Step 5: Get API Keys

1. In RevenueCat dashboard, go to **Project Settings** > **API Keys**
2. Copy your **Public API Key** (starts with `rcb_` or similar)
3. Add it to your `.env` file:

```env
VITE_REVENUECAT_API_KEY=your_public_api_key_here
```

## Step 6: Web Integration Options

RevenueCat doesn't have a native web SDK, so you have a few options:

### Option A: Use Stripe Checkout Directly (Recommended)

1. Create a backend endpoint that creates Stripe checkout sessions
2. After successful payment, create/update the customer in RevenueCat via REST API
3. Use webhooks to sync subscription status

### Option B: Use RevenueCat REST API

1. Create checkout sessions using RevenueCat REST API
2. Handle payment through Stripe
3. Sync subscription status

### Option C: Use a Payment Provider Wrapper

Use a service like Paddle, which has better web support and can integrate with RevenueCat.

## Step 7: Webhook Setup

Set up webhooks in RevenueCat to sync subscription status:

1. Go to **Project Settings** > **Webhooks**
2. Add webhook URL (your backend endpoint)
3. Subscribe to events:
   - `SUBSCRIBER_UPDATED`
   - `BILLING_ISSUES`

## Step 8: Testing

1. Use RevenueCat's sandbox mode for testing
2. Test subscription flows
3. Verify entitlement checks work correctly

## Implementation Notes

The current implementation:
- Uses RevenueCat REST API to check subscription status
- Tracks usage locally (localStorage) for AI features
- Falls back to free tier if RevenueCat is not configured
- Shows upgrade prompts when limits are reached

## Next Steps

1. Implement actual checkout flow (Stripe Checkout or similar)
2. Set up backend webhook handler for subscription updates
3. Move usage tracking to database for better accuracy
4. Add subscription management UI (cancel, change plan, etc.)


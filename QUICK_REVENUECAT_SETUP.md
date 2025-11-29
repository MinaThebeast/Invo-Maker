# Quick RevenueCat Native Setup

## Overview
This app uses **native mobile payments only** (Apple App Store and Google Play Store). Web version is read-only for subscription status.

## Quick Setup Steps

### 1. RevenueCat Dashboard
1. Create account at [revenuecat.com](https://www.revenuecat.com)
2. Create project: "INVO Maker"
3. Get **Public API Key** from Project Settings → API Keys
4. Add to `.env`:
   ```env
   VITE_REVENUECAT_API_KEY=rcb_...
   ```

### 2. App Store Setup (iOS)
1. **App Store Connect** → In-App Purchases
2. Create subscriptions:
   - Pro: $4.99/month
   - Gold: $11.99/month
3. Copy Product IDs

### 3. Play Store Setup (Android)
1. **Google Play Console** → Subscriptions
2. Create subscriptions:
   - Pro: $4.99/month
   - Gold: $11.99/month
3. Copy Product IDs

### 4. RevenueCat Products
1. Add products with IDs: `invo_maker_pro`, `invo_maker_gold`
2. Link iOS products to App Store Connect
3. Link Android products to Play Console
4. Create entitlements: `pro`, `gold`

### 5. Native App Integration
- Install RevenueCat SDK in iOS/Android
- Implement purchase flow (see `REVENUECAT_NATIVE_SETUP.md`)
- Use same user ID (Supabase user ID) across platforms

## Current Status

✅ **Web**: Subscription status checking works  
✅ **Native**: Purchase flow needs to be implemented in iOS/Android code  
✅ **RevenueCat**: REST API integration ready

## Documentation

- `REVENUECAT_NATIVE_SETUP.md` - Detailed setup guide
- RevenueCat Docs: https://docs.revenuecat.com

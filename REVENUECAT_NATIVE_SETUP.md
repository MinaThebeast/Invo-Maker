# RevenueCat Native Mobile Setup Guide

This guide covers setting up RevenueCat for **native mobile payments only** (Apple App Store and Google Play Store).

## Overview

- **Web**: Users can view subscription status but cannot subscribe (subscriptions are mobile-only)
- **iOS**: Subscriptions handled through Apple App Store via RevenueCat SDK
- **Android**: Subscriptions handled through Google Play Store via RevenueCat SDK
- **RevenueCat**: Manages entitlements and syncs subscription status across platforms

## Step 1: Create RevenueCat Account

1. Go to [RevenueCat](https://www.revenuecat.com/) and create an account
2. Create a new project: "INVO Maker"

## Step 2: Configure Products in App Stores

### iOS (Apple App Store)

1. **App Store Connect** → Your App → Features → In-App Purchases
2. Create subscriptions:
   - **INVO Maker Pro**: $4.99/month (auto-renewable subscription)
   - **INVO Maker Gold**: $11.99/month (auto-renewable subscription)
3. Copy the **Product IDs** (e.g., `com.minaarian.invomaker.pro`, `com.minaarian.invomaker.gold`)

### Android (Google Play Store)

1. **Google Play Console** → Your App → Monetize → Products → Subscriptions
2. Create subscriptions:
   - **INVO Maker Pro**: $4.99/month (auto-renewing subscription)
   - **INVO Maker Gold**: $11.99/month (auto-renewing subscription)
3. Copy the **Product IDs** (e.g., `invo_maker_pro`, `invo_maker_gold`)

## Step 3: Configure Products in RevenueCat

1. **RevenueCat Dashboard** → Products → Add Product

### Product 1: INVO Maker Pro
- **Product ID**: `invo_maker_pro`
- **Platform**: iOS
  - Connect to App Store Connect
  - Link to your iOS product ID
- **Platform**: Android
  - Connect to Google Play Console
  - Link to your Android product ID
- **Entitlement**: `pro`

### Product 2: INVO Maker Gold
- **Product ID**: `invo_maker_gold`
- **Platform**: iOS
  - Connect to App Store Connect
  - Link to your iOS product ID
- **Platform**: Android
  - Connect to Google Play Console
  - Link to your Android product ID
- **Entitlement**: `gold`

## Step 4: Create Entitlements

1. **RevenueCat Dashboard** → Entitlements → Add Entitlement

### Entitlement 1: Pro
- **Identifier**: `pro`
- **Attach Products**: `invo_maker_pro` (both iOS and Android)

### Entitlement 2: Gold
- **Identifier**: `gold`
- **Attach Products**: `invo_maker_gold` (both iOS and Android)

## Step 5: Get API Keys

1. **RevenueCat Dashboard** → Project Settings → API Keys
2. Copy your **Public API Key** (starts with `rcb_` or `rcw_`)
3. Add to your `.env` file:
   ```env
   VITE_REVENUECAT_API_KEY=your_public_api_key_here
   ```

## Step 6: Install RevenueCat SDK in Native Apps

### iOS (Xcode)

1. Add RevenueCat SDK via Swift Package Manager or CocoaPods:
   ```swift
   // Swift Package Manager
   // Add: https://github.com/RevenueCat/purchases-ios
   
   // Or CocoaPods
   // pod 'Purchases'
   ```

2. Initialize in `AppDelegate.swift` or `App.swift`:
   ```swift
   import RevenueCat
   
   Purchases.configure(withAPIKey: "your_public_api_key")
   ```

### Android (Gradle)

1. Add to `android/app/build.gradle`:
   ```gradle
   dependencies {
       implementation 'com.revenuecat.purchases:purchases:7.0.0'
   }
   ```

2. Initialize in `MainActivity.java` or `MainActivity.kt`:
   ```kotlin
   import com.revenuecat.purchases.Purchases
   
   Purchases.configure(
       PurchasesConfiguration.Builder(context, "your_public_api_key").build()
   )
   ```

## Step 7: Implement Purchase Flow in Native Code

### iOS Example (Swift)

```swift
import RevenueCat

// Get offerings
Purchases.shared.getOfferings { (offerings, error) in
    if let packages = offerings?.current?.availablePackages {
        // Show packages to user
    }
}

// Purchase a package
Purchases.shared.purchase(package: package) { (transaction, customerInfo, error, userCancelled) in
    if customerInfo?.entitlements["pro"]?.isActive == true {
        // User has Pro subscription
    }
}
```

### Android Example (Kotlin)

```kotlin
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.getOfferingsWith

// Get offerings
Purchases.sharedInstance.getOfferingsWith({ error ->
    // Handle error
}) { offerings ->
    val packages = offerings.current?.availablePackages
    // Show packages to user
}

// Purchase a package
Purchases.sharedInstance.purchaseWith(
    purchaseParams = PurchaseParams.Builder(activity, package).build(),
    onError = { error, userCancelled ->
        // Handle error
    }
) { transaction, customerInfo ->
    if (customerInfo.entitlements["pro"]?.isActive == true) {
        // User has Pro subscription
    }
}
```

## Step 8: Web Integration (Read-Only)

The web version uses RevenueCat REST API to check subscription status:

```typescript
// Already implemented in src/lib/revenuecat.ts
const customerInfo = await getCustomerInfo(userId);
const entitlements = customerInfo?.subscriber?.entitlements?.active || {};

if (entitlements['pro']) {
    // User has Pro subscription
}
```

## Step 9: Testing

### iOS Testing
1. Use **Sandbox** test accounts in App Store Connect
2. Test purchases won't charge real money
3. Verify entitlements appear in RevenueCat dashboard

### Android Testing
1. Use **License Testing** in Google Play Console
2. Add test accounts
3. Test purchases won't charge real money
4. Verify entitlements appear in RevenueCat dashboard

## Step 10: Webhook Setup (Optional)

Set up webhooks to sync subscription events:

1. **RevenueCat Dashboard** → Project Settings → Webhooks
2. Add webhook URL (your backend endpoint)
3. Subscribe to events:
   - `SUBSCRIBER_UPDATED`
   - `BILLING_ISSUES`
   - `INITIAL_PURCHASE`

## Verification Checklist

- ✅ Products created in App Store Connect and Google Play Console
- ✅ Products configured in RevenueCat with correct IDs
- ✅ Entitlements created and linked to products
- ✅ RevenueCat SDK installed in native apps
- ✅ Purchase flow implemented in native code
- ✅ API key added to `.env` file
- ✅ Subscription status checking works on web
- ✅ Test purchases work in sandbox/test environment

## Important Notes

1. **No Stripe Required**: Native payments use App Store and Play Store only
2. **Web is Read-Only**: Web version can check subscription status but cannot process purchases
3. **Cross-Platform Sync**: RevenueCat automatically syncs subscriptions across iOS, Android, and web
4. **User ID**: Use the same user ID (Supabase user ID) across all platforms for proper sync

## Troubleshooting

**Subscriptions not appearing:**
- Verify products are approved in App Store Connect/Play Console
- Check that product IDs match exactly in RevenueCat
- Ensure entitlements are linked to products

**Purchase flow not working:**
- Check RevenueCat SDK is properly initialized
- Verify API key is correct
- Check app logs for RevenueCat errors

**Web not showing subscription:**
- Verify `VITE_REVENUECAT_API_KEY` is set
- Check that user ID matches between native app and web
- Verify RevenueCat dashboard shows active subscription

## Next Steps

1. Implement native purchase UI in iOS/Android apps
2. Add subscription management (cancel, change plan) in native apps
3. Set up webhooks for server-side subscription events
4. Add subscription status indicators in web UI


# RevenueCat Capacitor Plugin Setup

## ✅ Fixed TypeScript Errors

The RevenueCat native plugin has been updated to use the proper Capacitor 7 plugin registration pattern.

## Current Status

- ✅ TypeScript errors fixed
- ✅ Plugin uses `registerPlugin` from Capacitor 7
- ✅ Web fallback implementation created
- ✅ Build successful

## Plugin Registration

The plugin is registered using Capacitor 7's `registerPlugin` API:

```typescript
import { registerPlugin } from '@capacitor/core';

const RevenueCatPlugin = registerPlugin<RevenueCatPluginInterface>('RevenueCat', {
  web: () => import('./revenuecatNative.web').then(m => new m.RevenueCatWeb()),
});
```

## Next Steps: Register Plugin in Native Code

### iOS

1. **Add RevenueCatPlugin.swift to Xcode:**
   - Open Xcode project
   - Right-click on `App` folder → "Add Files to App"
   - Select `RevenueCatPlugin.swift`
   - Make sure "Copy items if needed" is checked
   - Add to target: `App`

2. **Register the plugin:**
   The plugin should be automatically discovered by Capacitor. If not, you may need to add it to the Capacitor plugin registry.

### Android

1. **Create the plugin class:**
   Create `android/app/src/main/java/com/minaarian/invomaker/RevenueCatPlugin.java`:

```java
package com.minaarian.invomaker;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.revenuecat.purchases.Purchases;
import com.revenuecat.purchases.Offerings;
import com.revenuecat.purchases.Package;
import com.revenuecat.purchases.CustomerInfo;
import com.revenuecat.purchases.PurchasesError;
import com.revenuecat.purchases.interfaces.GetOfferingsCallback;
import com.revenuecat.purchases.interfaces.PurchaseCallback;
import com.revenuecat.purchases.interfaces.CustomerInfoCallback;
import com.revenuecat.purchases.interfaces.RestorePurchasesCallback;

@CapacitorPlugin(name = "RevenueCat")
public class RevenueCatPlugin extends Plugin {

    @PluginMethod
    public void identifyUser(PluginCall call) {
        String userId = call.getString("userId");
        if (userId == null || userId.isEmpty()) {
            call.reject("userId is required");
            return;
        }

        Purchases.getSharedInstance().logIn(userId, (customerInfo, created, error) -> {
            if (error != null) {
                call.reject("Failed to identify user: " + error.getMessage());
                return;
            }

            JSObject result = new JSObject();
            result.put("userId", userId);
            result.put("created", created);
            result.put("entitlements", customerInfo.getEntitlements().getActive().keySet().toArray());
            call.resolve(result);
        });
    }

    @PluginMethod
    public void getOfferings(PluginCall call) {
        Purchases.getSharedInstance().getOfferings(new GetOfferingsCallback() {
            @Override
            public void onReceived(Offerings offerings) {
                JSObject result = new JSObject();
                JSObject packages = new JSObject();
                
                if (offerings.getCurrent() != null) {
                    for (Package pkg : offerings.getCurrent().getAvailablePackages()) {
                        JSObject pkgObj = new JSObject();
                        pkgObj.put("identifier", pkg.getIdentifier());
                        pkgObj.put("productId", pkg.getStoreProduct().getId());
                        pkgObj.put("price", pkg.getStoreProduct().getPrice());
                        pkgObj.put("title", pkg.getStoreProduct().getTitle());
                        pkgObj.put("description", pkg.getStoreProduct().getDescription());
                        packages.put(pkg.getIdentifier(), pkgObj);
                    }
                }
                
                result.put("packages", packages);
                call.resolve(result);
            }

            @Override
            public void onError(PurchasesError error) {
                call.reject("Failed to get offerings: " + error.getMessage());
            }
        });
    }

    @PluginMethod
    public void purchasePackage(PluginCall call) {
        String packageIdentifier = call.getString("packageIdentifier");
        if (packageIdentifier == null || packageIdentifier.isEmpty()) {
            call.reject("packageIdentifier is required");
            return;
        }

        Purchases.getSharedInstance().getOfferings(new GetOfferingsCallback() {
            @Override
            public void onReceived(Offerings offerings) {
                if (offerings.getCurrent() == null) {
                    call.reject("No offerings available");
                    return;
                }

                Package targetPackage = null;
                for (Package pkg : offerings.getCurrent().getAvailablePackages()) {
                    if (pkg.getIdentifier().equals(packageIdentifier)) {
                        targetPackage = pkg;
                        break;
                    }
                }

                if (targetPackage == null) {
                    call.reject("Package not found");
                    return;
                }

                Purchases.getSharedInstance().purchase(targetPackage, new PurchaseCallback() {
                    @Override
                    public void onCompleted(com.revenuecat.purchases.Transaction transaction, CustomerInfo customerInfo) {
                        JSObject result = new JSObject();
                        result.put("success", true);
                        result.put("entitlements", customerInfo.getEntitlements().getActive().keySet().toArray());
                        call.resolve(result);
                    }

                    @Override
                    public void onError(PurchasesError error, boolean userCancelled) {
                        if (userCancelled) {
                            call.reject("User cancelled purchase", "USER_CANCELLED");
                        } else {
                            call.reject("Purchase failed: " + error.getMessage());
                        }
                    }
                });
            }

            @Override
            public void onError(PurchasesError error) {
                call.reject("Failed to get offerings: " + error.getMessage());
            }
        });
    }

    @PluginMethod
    public void getCustomerInfo(PluginCall call) {
        Purchases.getSharedInstance().getCustomerInfo(new CustomerInfoCallback() {
            @Override
            public void onReceived(CustomerInfo customerInfo) {
                JSObject result = new JSObject();
                result.put("userId", customerInfo.getOriginalAppUserId());
                result.put("entitlements", customerInfo.getEntitlements().getActive().keySet().toArray());
                result.put("activeSubscriptions", customerInfo.getActiveSubscriptions().toArray());
                result.put("allPurchasedProductIdentifiers", customerInfo.getAllPurchasedProductIdentifiers().toArray());
                call.resolve(result);
            }

            @Override
            public void onError(PurchasesError error) {
                call.reject("Failed to get customer info: " + error.getMessage());
            }
        });
    }

    @PluginMethod
    public void restorePurchases(PluginCall call) {
        Purchases.getSharedInstance().restorePurchases(new RestorePurchasesCallback() {
            @Override
            public void onReceived(CustomerInfo customerInfo) {
                JSObject result = new JSObject();
                result.put("entitlements", customerInfo.getEntitlements().getActive().keySet().toArray());
                call.resolve(result);
            }

            @Override
            public void onError(PurchasesError error) {
                call.reject("Failed to restore purchases: " + error.getMessage());
            }
        });
    }
}
```

2. **Sync Capacitor:**
   ```bash
   npm run cap:sync
   ```

## Usage in React/TypeScript

```typescript
import RevenueCat from './lib/revenuecatNative';

// After user logs in
await RevenueCat.identifyUser(user.id);

// Get available packages
const offerings = await RevenueCat.getOfferings();

// Purchase
await RevenueCat.purchasePackage('package_id');

// Get customer info
const info = await RevenueCat.getCustomerInfo();

// Restore purchases
await RevenueCat.restorePurchases();
```

## Testing

1. Build the app: `npm run build`
2. Sync Capacitor: `npm run cap:sync`
3. Open native project: `npm run cap:open ios` or `npm run cap:open android`
4. Build and run in Xcode/Android Studio

## Files

- `src/lib/revenuecatNative.ts` - Main plugin interface
- `src/lib/revenuecatNative.web.ts` - Web fallback
- `ios/App/App/RevenueCatPlugin.swift` - iOS implementation
- Android implementation (to be created)


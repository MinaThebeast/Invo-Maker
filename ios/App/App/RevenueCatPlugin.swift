import Foundation
import Capacitor
import RevenueCat

/**
 * RevenueCat Capacitor Plugin
 * Allows JavaScript to interact with RevenueCat SDK
 */
@objc(RevenueCatPlugin)
public class RevenueCatPlugin: CAPPlugin {
    
    /**
     * Set the app user ID (Supabase user ID)
     * Call this after user logs in from JavaScript
     */
    @objc func identifyUser(_ call: CAPPluginCall) {
        guard let userId = call.getString("userId") else {
            call.reject("userId is required")
            return
        }
        
        Purchases.shared.logIn(userId) { (customerInfo, created, error) in
            if let error = error {
                print("❌ RevenueCat login error: \(error.localizedDescription)")
                call.reject("Failed to identify user: \(error.localizedDescription)")
                return
            }
            
            if let customerInfo = customerInfo {
                print("✅ RevenueCat user identified: \(userId)")
                print("   Active entitlements: \(customerInfo.entitlements.active.keys.joined(separator: ", "))")
                
                call.resolve([
                    "userId": userId,
                    "created": created,
                    "entitlements": Array(customerInfo.entitlements.active.keys)
                ])
            } else {
                call.reject("No customer info returned")
            }
        }
    }
    
    /**
     * Get current offerings (available subscription packages)
     */
    @objc func getOfferings(_ call: CAPPluginCall) {
        Purchases.shared.getOfferings { (offerings, error) in
            if let error = error {
                call.reject("Failed to get offerings: \(error.localizedDescription)")
                return
            }
            
            guard let offerings = offerings else {
                call.reject("No offerings available")
                return
            }
            
            var packages: [[String: Any]] = []
            
            if let currentOffering = offerings.current {
                for package in currentOffering.availablePackages {
                    packages.append([
                        "identifier": package.identifier,
                        "productId": package.storeProduct.productIdentifier,
                        "price": package.storeProduct.localizedPriceString ?? "",
                        "title": package.storeProduct.localizedTitle,
                        "description": package.storeProduct.localizedDescription
                    ])
                }
            }
            
            call.resolve([
                "packages": packages
            ])
        }
    }
    
    /**
     * Purchase a package
     */
    @objc func purchasePackage(_ call: CAPPluginCall) {
        guard let packageIdentifier = call.getString("packageIdentifier") else {
            call.reject("packageIdentifier is required")
            return
        }
        
        Purchases.shared.getOfferings { (offerings, error) in
            if let error = error {
                call.reject("Failed to get offerings: \(error.localizedDescription)")
                return
            }
            
            guard let offerings = offerings,
                  let currentOffering = offerings.current,
                  let package = currentOffering.availablePackages.first(where: { $0.identifier == packageIdentifier }) else {
                call.reject("Package not found")
                return
            }
            
            Purchases.shared.purchase(package: package) { (transaction, customerInfo, error, userCancelled) in
                if let error = error {
                    if userCancelled {
                        call.reject("User cancelled purchase", "USER_CANCELLED")
                    } else {
                        call.reject("Purchase failed: \(error.localizedDescription)")
                    }
                    return
                }
                
                guard let customerInfo = customerInfo else {
                    call.reject("No customer info returned")
                    return
                }
                
                let activeEntitlements = Array(customerInfo.entitlements.active.keys)
                
                call.resolve([
                    "success": true,
                    "entitlements": activeEntitlements
                ])
            }
        }
    }
    
    /**
     * Get current customer info
     */
    @objc func getCustomerInfo(_ call: CAPPluginCall) {
        Purchases.shared.getCustomerInfo { (customerInfo, error) in
            if let error = error {
                call.reject("Failed to get customer info: \(error.localizedDescription)")
                return
            }
            
            guard let customerInfo = customerInfo else {
                call.reject("No customer info available")
                return
            }
            
            let activeEntitlements = Array(customerInfo.entitlements.active.keys)
            
            call.resolve([
                "userId": customerInfo.originalAppUserId,
                "entitlements": activeEntitlements,
                "activeSubscriptions": Array(customerInfo.activeSubscriptions),
                "allPurchasedProductIdentifiers": Array(customerInfo.allPurchasedProductIdentifiers)
            ])
        }
    }
    
    /**
     * Restore purchases
     */
    @objc func restorePurchases(_ call: CAPPluginCall) {
        Purchases.shared.restorePurchases { (customerInfo, error) in
            if let error = error {
                call.reject("Failed to restore purchases: \(error.localizedDescription)")
                return
            }
            
            guard let customerInfo = customerInfo else {
                call.reject("No customer info available")
                return
            }
            
            let activeEntitlements = Array(customerInfo.entitlements.active.keys)
            
            call.resolve([
                "entitlements": activeEntitlements
            ])
        }
    }
}


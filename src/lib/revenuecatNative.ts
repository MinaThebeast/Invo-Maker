/**
 * RevenueCat Native Integration
 * Functions to interact with RevenueCat SDK in native iOS/Android apps
 * 
 * Note: This requires the RevenueCat Capacitor plugin to be registered in native code.
 * See ios/App/App/RevenueCatPlugin.swift for iOS implementation.
 */

import { registerPlugin } from '@capacitor/core';

// Define plugin interface
interface RevenueCatPluginInterface {
  identifyUser(options: { userId: string }): Promise<{ userId: string; created: boolean; entitlements: string[] }>;
  getOfferings(): Promise<{ packages: Array<{ identifier: string; productId: string; price: string; title: string; description: string }> }>;
  purchasePackage(options: { packageIdentifier: string }): Promise<{ success: boolean; entitlements: string[] }>;
  getCustomerInfo(): Promise<{ userId: string; entitlements: string[]; activeSubscriptions: string[]; allPurchasedProductIdentifiers: string[] }>;
  restorePurchases(): Promise<{ entitlements: string[] }>;
}

// Register the plugin (will be available after native implementation)
const RevenueCatPlugin = registerPlugin<RevenueCatPluginInterface>('RevenueCat', {
  web: () => import('./revenuecatNative.web').then(m => new m.RevenueCatWeb()),
});

// Export convenience wrapper
const RevenueCat = {
  /**
   * Identify user with Supabase user ID
   * Call this after user logs in
   */
  async identifyUser(userId: string) {
    try {
      return await RevenueCatPlugin.identifyUser({ userId });
    } catch (error) {
      console.error('Error identifying RevenueCat user:', error);
      throw error;
    }
  },

  /**
   * Get available subscription packages
   */
  async getOfferings() {
    try {
      return await RevenueCatPlugin.getOfferings();
    } catch (error) {
      console.error('Error getting RevenueCat offerings:', error);
      throw error;
    }
  },

  /**
   * Purchase a subscription package
   */
  async purchasePackage(packageIdentifier: string) {
    try {
      return await RevenueCatPlugin.purchasePackage({ packageIdentifier });
    } catch (error: any) {
      if (error.code === 'USER_CANCELLED') {
        throw new Error('User cancelled the purchase');
      }
      console.error('Error purchasing package:', error);
      throw error;
    }
  },

  /**
   * Get current customer info
   */
  async getCustomerInfo() {
    try {
      return await RevenueCatPlugin.getCustomerInfo();
    } catch (error) {
      console.error('Error getting customer info:', error);
      throw error;
    }
  },

  /**
   * Restore purchases
   */
  async restorePurchases() {
    try {
      return await RevenueCatPlugin.restorePurchases();
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  },
};

export default RevenueCat;


/**
 * RevenueCat Native Integration
 * Functions to interact with RevenueCat SDK in native iOS/Android apps
 */

import { Capacitor } from '@capacitor/core';

interface RevenueCatPlugin {
  identifyUser(options: { userId: string }): Promise<{ userId: string; created: boolean; entitlements: string[] }>;
  getOfferings(): Promise<{ packages: Array<{ identifier: string; productId: string; price: string; title: string; description: string }> }>;
  purchasePackage(options: { packageIdentifier: string }): Promise<{ success: boolean; entitlements: string[] }>;
  getCustomerInfo(): Promise<{ userId: string; entitlements: string[]; activeSubscriptions: string[]; allPurchasedProductIdentifiers: string[] }>;
  restorePurchases(): Promise<{ entitlements: string[] }>;
}

// Register the plugin (will be available after native implementation)
const RevenueCat = {
  /**
   * Identify user with Supabase user ID
   * Call this after user logs in
   */
  async identifyUser(userId: string) {
    if (!Capacitor.isNativePlatform()) {
      console.warn('RevenueCat identifyUser is only available on native platforms');
      return { userId, created: false, entitlements: [] };
    }

    try {
      const plugin = (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android')
        ? (await import('@capacitor/core')).Plugins as any
        : null;

      if (plugin?.RevenueCat) {
        return await plugin.RevenueCat.identifyUser({ userId });
      } else {
        // Fallback: try direct plugin access
        const { Plugins } = await import('@capacitor/core');
        return await (Plugins as any).RevenueCat.identifyUser({ userId });
      }
    } catch (error) {
      console.error('Error identifying RevenueCat user:', error);
      throw error;
    }
  },

  /**
   * Get available subscription packages
   */
  async getOfferings() {
    if (!Capacitor.isNativePlatform()) {
      return { packages: [] };
    }

    try {
      const { Plugins } = await import('@capacitor/core');
      return await (Plugins as any).RevenueCat.getOfferings();
    } catch (error) {
      console.error('Error getting RevenueCat offerings:', error);
      throw error;
    }
  },

  /**
   * Purchase a subscription package
   */
  async purchasePackage(packageIdentifier: string) {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Purchases are only available on native platforms');
    }

    try {
      const { Plugins } = await import('@capacitor/core');
      return await (Plugins as any).RevenueCat.purchasePackage({ packageIdentifier });
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
    if (!Capacitor.isNativePlatform()) {
      return { userId: '', entitlements: [], activeSubscriptions: [], allPurchasedProductIdentifiers: [] };
    }

    try {
      const { Plugins } = await import('@capacitor/core');
      return await (Plugins as any).RevenueCat.getCustomerInfo();
    } catch (error) {
      console.error('Error getting customer info:', error);
      throw error;
    }
  },

  /**
   * Restore purchases
   */
  async restorePurchases() {
    if (!Capacitor.isNativePlatform()) {
      return { entitlements: [] };
    }

    try {
      const { Plugins } = await import('@capacitor/core');
      return await (Plugins as any).RevenueCat.restorePurchases();
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  },
};

export default RevenueCat;


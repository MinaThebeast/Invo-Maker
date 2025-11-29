/**
 * RevenueCat Web Implementation (Fallback)
 * This is used when the app runs on web platform
 */

export class RevenueCatWeb {
  async identifyUser(_options: { userId: string }) {
    console.warn('RevenueCat identifyUser is only available on native platforms');
    return { userId: _options.userId, created: false, entitlements: [] };
  }

  async getOfferings() {
    return { packages: [] };
  }

  async purchasePackage(_options: { packageIdentifier: string }): Promise<{ success: boolean; entitlements: string[] }> {
    throw new Error('Purchases are only available on native platforms');
  }

  async getCustomerInfo() {
    return { userId: '', entitlements: [], activeSubscriptions: [], allPurchasedProductIdentifiers: [] };
  }

  async restorePurchases() {
    return { entitlements: [] };
  }
}


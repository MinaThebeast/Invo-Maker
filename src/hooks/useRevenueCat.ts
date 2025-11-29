/**
 * React hook for RevenueCat integration
 * Automatically identifies user after login
 */

import { useEffect } from 'react';
import { useAuth } from './useAuth';
import RevenueCat from '../lib/revenuecatNative';
import { Capacitor } from '@capacitor/core';

export function useRevenueCat() {
  const { user } = useAuth();

  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Identify user with RevenueCat after login
    if (user?.id) {
      RevenueCat.identifyUser(user.id)
        .then((result) => {
          console.log('✅ RevenueCat user identified:', result);
        })
        .catch((error) => {
          console.error('❌ RevenueCat identify error:', error);
        });
    }
  }, [user?.id]);

  return {
    identifyUser: (userId: string) => RevenueCat.identifyUser(userId),
    getOfferings: () => RevenueCat.getOfferings(),
    purchasePackage: (packageIdentifier: string) => RevenueCat.purchasePackage(packageIdentifier),
    getCustomerInfo: () => RevenueCat.getCustomerInfo(),
    restorePurchases: () => RevenueCat.restorePurchases(),
  };
}


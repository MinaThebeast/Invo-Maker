// RevenueCat integration
// Note: RevenueCat SDK is primarily for React Native
// For web, you'll need to use their REST API or a web-compatible SDK

const revenueCatApiKey = import.meta.env.VITE_REVENUECAT_API_KEY;
const revenueCatAppUserId = import.meta.env.VITE_REVENUECAT_APP_USER_ID || 'default';

export interface RevenueCatConfig {
  apiKey: string;
  appUserId: string;
}

export const revenueCatConfig: RevenueCatConfig | null = revenueCatApiKey
  ? { apiKey: revenueCatApiKey, appUserId: revenueCatAppUserId }
  : null;

// RevenueCat REST API helper functions
export async function getCustomerInfo(userId: string) {
  if (!revenueCatConfig) {
    // Return default free tier if not configured (silently)
    return {
      subscriber: {
        entitlements: {
          active: {},
        },
      },
    };
  }

  try {
    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${revenueCatConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // If user doesn't exist in RevenueCat, return free tier (silently)
      if (response.status === 404) {
        return {
          subscriber: {
            entitlements: {
              active: {},
            },
          },
        };
      }
      // For other errors, return free tier silently (don't throw)
      return {
        subscriber: {
          entitlements: {
            active: {},
          },
        },
      };
    }

    return response.json();
  } catch (error) {
    // Only log errors in development and if RevenueCat is configured
    if (import.meta.env.DEV && revenueCatConfig) {
      console.warn('RevenueCat API error (defaulting to free tier):', error);
    }
    // Return free tier on error (silently)
    return {
      subscriber: {
        entitlements: {
          active: {},
        },
      },
    };
  }
}

export async function checkSubscriptionStatus(userId: string): Promise<boolean> {
  try {
    const info = await getCustomerInfo(userId);
    // Check if user has active entitlement
    const activeEntitlements = info?.subscriber?.entitlements?.active || {};
    return Object.keys(activeEntitlements).length > 0;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

import { supabase } from './supabase';

/**
 * Create a checkout session for a subscription
 * Uses Supabase Edge Function to create Stripe checkout session
 */
export async function createCheckoutSession(
  userId: string,
  planId: string,
  userEmail: string
): Promise<{ url: string; sessionId: string }> {
  const successUrl = `${window.location.origin}/settings?subscription=success&plan=${planId}`;
  const cancelUrl = `${window.location.origin}/settings?subscription=cancelled`;

  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: {
      userId,
      planId,
      userEmail,
      successUrl,
      cancelUrl,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to create checkout session');
  }

  if (!data?.url) {
    throw new Error('No checkout URL returned');
  }

  return { url: data.url, sessionId: data.sessionId };
}


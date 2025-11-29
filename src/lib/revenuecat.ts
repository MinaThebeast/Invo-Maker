// RevenueCat integration
// Note: RevenueCat SDK is primarily for React Native
// For web, you'll need to use their REST API or a web-compatible SDK

const revenueCatApiKey = import.meta.env.VITE_REVENUECAT_API_KEY;

export interface RevenueCatConfig {
  apiKey: string;
}

export const revenueCatConfig: RevenueCatConfig | null = revenueCatApiKey
  ? { apiKey: revenueCatApiKey }
  : null;

// RevenueCat REST API helper functions
export async function getCustomerInfo(userId: string) {
  if (!revenueCatConfig) {
    throw new Error('RevenueCat not configured');
  }

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
    throw new Error('Failed to fetch customer info');
  }

  return response.json();
}

export async function checkSubscriptionStatus(userId: string): Promise<boolean> {
  try {
    const info = await getCustomerInfo(userId);
    // Check if user has active entitlement
    // Adjust based on your RevenueCat setup
    return info?.subscriber?.entitlements?.active?.length > 0;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}


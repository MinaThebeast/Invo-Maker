import { supabase } from '../lib/supabase';
import { getCustomerInfo } from '../lib/revenuecat';
import { useAuth } from '../hooks/useAuth';

export type SubscriptionTier = 'free' | 'pro' | 'gold';

export interface SubscriptionLimits {
  invoices: number; // -1 for unlimited
  products: number; // -1 for unlimited
  aiSummaries: number; // -1 for unlimited
  aiInvoiceCreation: number; // -1 for unlimited
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceId: string; // RevenueCat product ID
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'INVO Maker Free',
    price: 0,
    priceId: 'free',
    tier: 'free',
    limits: {
      invoices: 10,
      products: -1, // unlimited
      aiSummaries: 10,
      aiInvoiceCreation: 10,
    },
    features: [
      '10 invoices per month',
      'Unlimited products',
      '10 AI summaries',
      '10 AI invoice creations',
      'Basic invoice management',
      'PDF generation',
      'Email sending',
    ],
  },
  {
    id: 'pro',
    name: 'INVO Maker Pro',
    price: 4.99,
    priceId: 'invo_maker_pro', // RevenueCat product ID
    tier: 'pro',
    limits: {
      invoices: -1, // unlimited
      products: -1, // unlimited
      aiSummaries: 50,
      aiInvoiceCreation: 50,
    },
    features: [
      'Unlimited invoices',
      'Unlimited products',
      '50 AI summaries per month',
      '50 AI invoice creations per month',
      'All Free features',
      'Priority support',
    ],
  },
  {
    id: 'gold',
    name: 'INVO Maker Gold',
    price: 11.99,
    priceId: 'invo_maker_gold', // RevenueCat product ID
    tier: 'gold',
    limits: {
      invoices: -1, // unlimited
      products: -1, // unlimited
      aiSummaries: -1, // unlimited
      aiInvoiceCreation: -1, // unlimited
    },
    features: [
      'Unlimited everything',
      'Unlimited AI summaries',
      'Unlimited AI invoice creations',
      'All Pro features',
      'Advanced analytics',
      'Priority support',
    ],
  },
];

export interface UsageStats {
  invoices: number;
  aiSummaries: number;
  aiInvoiceCreation: number;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
}

/**
 * Get user's current subscription tier from RevenueCat
 */
export async function getCurrentSubscription(userId: string): Promise<SubscriptionTier> {
  try {
    if (!import.meta.env.VITE_REVENUECAT_API_KEY) {
      return 'free';
    }

    const customerInfo = await getCustomerInfo(userId);
    const entitlements = customerInfo?.subscriber?.entitlements?.active || {};
    
    // Check for gold tier
    if (entitlements['gold'] || entitlements['invo_maker_gold']) {
      return 'gold';
    }
    
    // Check for pro tier
    if (entitlements['pro'] || entitlements['invo_maker_pro']) {
      return 'pro';
    }
    
    return 'free';
  } catch (error) {
    // Silently default to free tier on error
    // Only log in development if RevenueCat is configured
    if (import.meta.env.DEV && import.meta.env.VITE_REVENUECAT_API_KEY) {
      console.warn('Subscription check failed (defaulting to free):', error);
    }
    return 'free';
  }
}

/**
 * Get subscription plan by tier
 */
export function getPlanByTier(tier: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((plan) => plan.tier === tier) || SUBSCRIPTION_PLANS[0];
}

/**
 * Get usage stats for current period
 */
export async function getUsageStats(userId: string): Promise<UsageStats> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get invoice count for current month
    const { count: invoiceCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    // Get AI usage from a usage tracking table (we'll create this)
    // For now, we'll use localStorage as a fallback
    const aiUsage = JSON.parse(
      localStorage.getItem(`ai_usage_${userId}_${now.getFullYear()}_${now.getMonth()}`) || '{"summaries": 0, "invoiceCreation": 0}'
    );

    return {
      invoices: invoiceCount || 0,
      aiSummaries: aiUsage.summaries || 0,
      aiInvoiceCreation: aiUsage.invoiceCreation || 0,
      periodStart: startOfMonth.toISOString(),
      periodEnd: endOfMonth.toISOString(),
    };
  } catch (error) {
    // Silently return zero usage on error
    // Only log in development
    if (import.meta.env.DEV) {
      console.warn('Usage stats error (defaulting to zero):', error);
    }
    return {
      invoices: 0,
      aiSummaries: 0,
      aiInvoiceCreation: 0,
      periodStart: new Date().toISOString(),
      periodEnd: new Date().toISOString(),
    };
  }
}

/**
 * Check if user can perform an action based on their subscription
 */
export async function canPerformAction(
  userId: string,
  action: 'invoice' | 'aiSummary' | 'aiInvoiceCreation'
): Promise<{ allowed: boolean; reason?: string }> {
  const tier = await getCurrentSubscription(userId);
  const plan = getPlanByTier(tier);
  const usage = await getUsageStats(userId);

  let limit: number;
  let currentUsage: number;

  switch (action) {
    case 'invoice':
      limit = plan.limits.invoices;
      currentUsage = usage.invoices;
      break;
    case 'aiSummary':
      limit = plan.limits.aiSummaries;
      currentUsage = usage.aiSummaries;
      break;
    case 'aiInvoiceCreation':
      limit = plan.limits.aiInvoiceCreation;
      currentUsage = usage.aiInvoiceCreation;
      break;
  }

  if (limit === -1) {
    return { allowed: true };
  }

  if (currentUsage >= limit) {
    return {
      allowed: false,
      reason: `You've reached your ${plan.name} limit of ${limit} ${action === 'invoice' ? 'invoices' : action === 'aiSummary' ? 'AI summaries' : 'AI invoice creations'} this month. Upgrade to continue.`,
    };
  }

  return { allowed: true };
}

/**
 * Track AI usage
 */
export async function trackAIUsage(
  userId: string,
  type: 'aiSummary' | 'aiInvoiceCreation'
): Promise<void> {
  try {
    const now = new Date();
    const key = `ai_usage_${userId}_${now.getFullYear()}_${now.getMonth()}`;
    const current = JSON.parse(localStorage.getItem(key) || '{"summaries": 0, "invoiceCreation": 0}');
    
    if (type === 'aiSummary') {
      current.summaries = (current.summaries || 0) + 1;
    } else {
      current.invoiceCreation = (current.invoiceCreation || 0) + 1;
    }
    
    localStorage.setItem(key, JSON.stringify(current));
  } catch (error) {
    console.error('Error tracking AI usage:', error);
  }
}

/**
 * Create RevenueCat checkout URL
 */
export function getCheckoutURL(planId: string, userId: string): string {
  // RevenueCat web checkout URL
  // This will need to be configured in RevenueCat dashboard
  const baseURL = 'https://api.revenuecat.com/v1/subscribers';
  return `${baseURL}/${userId}/offerings/${planId}`;
}


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getCurrentSubscription,
  getPlanByTier,
  getUsageStats,
  canPerformAction,
  trackAIUsage,
  SubscriptionTier,
  SubscriptionPlan,
  UsageStats,
} from '../services/subscriptionService';

export function useSubscription() {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const currentTier = await getCurrentSubscription(user.id);
      const currentPlan = getPlanByTier(currentTier);
      const currentUsage = await getUsageStats(user.id);

      setTier(currentTier);
      setPlan(currentPlan);
      setUsage(currentUsage);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const checkAction = useCallback(
    async (action: 'invoice' | 'aiSummary' | 'aiInvoiceCreation') => {
      if (!user) return { allowed: false, reason: 'Not authenticated' };
      return await canPerformAction(user.id, action);
    },
    [user]
  );

  const trackUsage = useCallback(
    async (type: 'aiSummary' | 'aiInvoiceCreation') => {
      if (!user) return;
      await trackAIUsage(user.id, type);
      // Reload usage stats
      const currentUsage = await getUsageStats(user.id);
      setUsage(currentUsage);
    },
    [user]
  );

  return {
    tier,
    plan,
    usage,
    loading,
    refresh: loadSubscription,
    checkAction,
    trackUsage,
  };
}


import { useState, useEffect } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../services/subscriptionService';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Check, Crown, Zap, Sparkles, CreditCard, AlertCircle } from 'lucide-react';
import { useToast, ToastContainer } from '../components/ui/ToastContainer';

export default function Billing() {
  const { user } = useAuth();
  const { tier, plan, usage, loading, refresh } = useSubscription();
  const { success, error: showError, toasts, removeToast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleSubscribe = async (selectedPlan: SubscriptionPlan) => {
    if (!user) {
      showError('Please log in to subscribe');
      return;
    }

    if (selectedPlan.tier === 'free') {
      // Free plan - just refresh
      await refresh();
      success('Switched to Free plan');
      return;
    }

    setProcessing(selectedPlan.id);

    try {
      // For web, RevenueCat uses their REST API
      // You'll need to set up RevenueCat web integration
      // This is a placeholder - you'll need to implement the actual checkout flow
      
      // Option 1: Use RevenueCat's web SDK or REST API
      // Option 2: Redirect to a payment page
      // Option 3: Use Stripe directly and sync with RevenueCat
      
      // For now, we'll show a message
      alert(
        `To subscribe to ${selectedPlan.name}, please configure RevenueCat web integration.\n\n` +
        `Product ID: ${selectedPlan.priceId}\n` +
        `Price: $${selectedPlan.price}/month`
      );
      
      // TODO: Implement actual RevenueCat checkout
      // Example:
      // const checkoutURL = await createRevenueCatCheckout(user.id, selectedPlan.priceId);
      // window.location.href = checkoutURL;
      
    } catch (err: any) {
      showError(err.message || 'Failed to process subscription');
    } finally {
      setProcessing(null);
    }
  };

  const getUsagePercentage = (current: number, limit: number): number => {
    if (limit === -1) return 0; // unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-1">Manage your subscription and usage</p>
        </div>

        {/* Current Plan */}
        {plan && (
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
                <p className="text-2xl font-bold text-primary-600 mt-1">{plan.name}</p>
                {plan.price > 0 && (
                  <p className="text-gray-600 mt-1">${plan.price.toFixed(2)}/month</p>
                )}
              </div>
              <div className="text-right">
                {tier === 'gold' && <Crown className="w-12 h-12 text-yellow-500" />}
                {tier === 'pro' && <Zap className="w-12 h-12 text-blue-500" />}
                {tier === 'free' && <Sparkles className="w-12 h-12 text-gray-400" />}
              </div>
            </div>
          </div>
        )}

        {/* Usage Stats */}
        {usage && plan && (
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Usage</h2>
            <div className="space-y-4">
              {/* Invoices Usage */}
              {plan.limits.invoices !== -1 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">Invoices</span>
                    <span className="text-gray-600">
                      {usage.invoices} / {plan.limits.invoices}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(
                        getUsagePercentage(usage.invoices, plan.limits.invoices)
                      )}`}
                      style={{
                        width: `${getUsagePercentage(usage.invoices, plan.limits.invoices)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* AI Summaries Usage */}
              {plan.limits.aiSummaries !== -1 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">AI Summaries</span>
                    <span className="text-gray-600">
                      {usage.aiSummaries} / {plan.limits.aiSummaries}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(
                        getUsagePercentage(usage.aiSummaries, plan.limits.aiSummaries)
                      )}`}
                      style={{
                        width: `${getUsagePercentage(usage.aiSummaries, plan.limits.aiSummaries)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* AI Invoice Creation Usage */}
              {plan.limits.aiInvoiceCreation !== -1 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">AI Invoice Creation</span>
                    <span className="text-gray-600">
                      {usage.aiInvoiceCreation} / {plan.limits.aiInvoiceCreation}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(
                        getUsagePercentage(usage.aiInvoiceCreation, plan.limits.aiInvoiceCreation)
                      )}`}
                      style={{
                        width: `${getUsagePercentage(usage.aiInvoiceCreation, plan.limits.aiInvoiceCreation)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Unlimited indicators */}
              {(plan.limits.invoices === -1 ||
                plan.limits.aiSummaries === -1 ||
                plan.limits.aiInvoiceCreation === -1) && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Some features are unlimited on your plan</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((subscriptionPlan) => {
              const isCurrentPlan = subscriptionPlan.tier === tier;
              const isProcessing = processing === subscriptionPlan.id;

              return (
                <div
                  key={subscriptionPlan.id}
                  className={`bg-white rounded-lg shadow p-6 border-2 ${
                    isCurrentPlan
                      ? 'border-primary-500'
                      : subscriptionPlan.tier === 'gold'
                      ? 'border-yellow-400'
                      : 'border-gray-200'
                  } relative`}
                >
                  {isCurrentPlan && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        Current
                      </span>
                    </div>
                  )}

                  {subscriptionPlan.tier === 'gold' && (
                    <div className="absolute top-4 left-4">
                      <Crown className="w-6 h-6 text-yellow-500" />
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{subscriptionPlan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900">
                        ${subscriptionPlan.price.toFixed(2)}
                      </span>
                      {subscriptionPlan.price > 0 && (
                        <span className="text-gray-600">/month</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {subscriptionPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(subscriptionPlan)}
                    disabled={isCurrentPlan || isProcessing}
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Processing...</span>
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : subscriptionPlan.price === 0 ? (
                      'Switch to Free'
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RevenueCat Setup Notice */}
        {!import.meta.env.VITE_REVENUECAT_API_KEY && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">RevenueCat Not Configured</h3>
              <p className="text-sm text-amber-800">
                To enable subscriptions, configure RevenueCat in your environment variables.
                Add <code className="bg-amber-100 px-1 rounded">VITE_REVENUECAT_API_KEY</code> to
                your .env file.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings as SettingsIcon, CreditCard, Receipt, HelpCircle } from 'lucide-react';
import SettingsTab from '../components/settings/SettingsTab';
import SubscriptionTab from '../components/settings/SubscriptionTab';
import BillingHistoryTab from '../components/settings/BillingHistoryTab';
import HelpTab from '../components/settings/HelpTab';
import { useToast, ToastContainer } from '../components/ui/ToastContainer';

type TabType = 'settings' | 'subscription' | 'billing' | 'help';

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const { toasts, success, error: showError, removeToast } = useToast();

  // Handle subscription success/cancel from Stripe redirect
  useEffect(() => {
    const subscription = searchParams.get('subscription');
    const plan = searchParams.get('plan');

    if (subscription === 'success') {
      success(`Successfully subscribed to ${plan || 'plan'}! Your subscription is now active.`);
      setActiveTab('subscription');
      // Clean up URL
      setSearchParams({});
    } else if (subscription === 'cancelled') {
      showError('Subscription cancelled. No charges were made.');
      setActiveTab('subscription');
      // Clean up URL
      setSearchParams({});
    }
  }, [searchParams, success, showError, setSearchParams]);

  const tabs = [
    { id: 'settings' as TabType, label: 'Settings', icon: SettingsIcon },
    { id: 'subscription' as TabType, label: 'Subscription', icon: CreditCard },
    { id: 'billing' as TabType, label: 'Billing', icon: Receipt },
    { id: 'help' as TabType, label: 'Help', icon: HelpCircle },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon
                  className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'subscription' && <SubscriptionTab />}
        {activeTab === 'billing' && <BillingHistoryTab />}
        {activeTab === 'help' && <HelpTab />}
      </div>
    </div>
    </>
  );
}

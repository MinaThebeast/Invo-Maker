import { Receipt } from 'lucide-react';

export default function BillingHistoryTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Billing History</h2>
        <p className="text-gray-600 mt-1">View your past invoices and payments</p>
      </div>

      <div className="bg-white rounded-lg shadow p-12 border border-gray-200 text-center">
        <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Billing History</h3>
        <p className="text-gray-600">
          Your billing history will appear here once you have active subscriptions or payments.
        </p>
      </div>
    </div>
  );
}


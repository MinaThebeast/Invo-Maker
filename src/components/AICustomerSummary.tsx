import { useState, useEffect } from 'react';
import { generateCustomerSummary, calculatePaymentRisk } from '../services/aiAnalyticsService';
import { Customer, Invoice } from '../types';
import { Sparkles, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Button from './ui/Button';

interface AICustomerSummaryProps {
  customer: Customer;
  invoices: Invoice[];
}

export default function AICustomerSummary({ customer, invoices }: AICustomerSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [risk, setRisk] = useState<{
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
    explanation: string;
  } | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      // Calculate stats
      const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
      const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);
      const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
      const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');

      // Calculate average days to pay
      let averageDaysToPay = 0;
      if (paidInvoices.length > 0) {
        const daysToPay = paidInvoices.map((inv) => {
          const paidDate = new Date(inv.updated_at);
          const dueDate = new Date(inv.due_date);
          return Math.max(0, Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        });
        averageDaysToPay = daysToPay.reduce((sum, days) => sum + days, 0) / daysToPay.length;
      }

      // Calculate payment risk
      const latePayments = invoices.filter((inv) => {
        if (inv.status === 'paid') {
          const paidDate = new Date(inv.updated_at);
          const dueDate = new Date(inv.due_date);
          return paidDate > dueDate;
        }
        return inv.status === 'overdue';
      }).length;

      const latePaymentDays = invoices
        .filter((inv) => inv.status === 'paid' || inv.status === 'overdue')
        .map((inv) => {
          const checkDate = inv.status === 'paid' ? new Date(inv.updated_at) : new Date();
          const dueDate = new Date(inv.due_date);
          return Math.max(0, Math.floor((checkDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        });

      const averageDaysLate = latePaymentDays.length > 0
        ? latePaymentDays.reduce((sum, days) => sum + days, 0) / latePaymentDays.length
        : 0;

      const paymentRisk = calculatePaymentRisk({
        totalInvoices: invoices.length,
        latePayments,
        averageDaysLate,
        currentOverdue: totalOutstanding,
      });
      setRisk(paymentRisk);

      // Generate AI summary
      setLoading(true);
      setError('');
      try {
        const aiSummary = await generateCustomerSummary(customer, {
          total_invoiced: totalInvoiced,
          total_paid: totalPaid,
          total_outstanding: totalOutstanding,
          invoice_count: invoices.length,
          paid_count: paidInvoices.length,
          overdue_count: overdueInvoices.length,
          averageDaysToPay,
        });
        setSummary(aiSummary);
      } catch (err: any) {
        setError(err.message || 'Failed to generate summary');
        console.error('Error generating summary:', err);
      } finally {
        setLoading(false);
      }
    };

    if (customer && invoices.length >= 0) {
      loadSummary();
    }
  }, [customer, invoices]);

  const getRiskIcon = () => {
    if (!risk) return null;
    switch (risk.riskLevel) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getRiskColor = () => {
    if (!risk) return 'bg-gray-100';
    switch (risk.riskLevel) {
      case 'high':
        return 'bg-red-100 border-red-300';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-green-100 border-green-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Risk */}
      {risk && (
        <div className={`rounded-lg p-4 border ${getRiskColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getRiskIcon()}
              <div>
                <div className="font-semibold text-gray-900 capitalize">
                  Payment Risk: {risk.riskLevel}
                </div>
                <div className="text-sm text-gray-600">{risk.explanation}</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-700">{risk.riskScore}%</div>
          </div>
        </div>
      )}

      {/* AI Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Customer Summary
          </h3>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </Button>
        </div>
        {loading && !summary ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Generating insights...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-gray-700 leading-relaxed">{summary || 'No summary available'}</p>
        )}
      </div>
    </div>
  );
}


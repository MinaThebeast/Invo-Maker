import { useState, useEffect, useRef, useCallback } from 'react';
import { generateDashboardSummary } from '../services/aiAnalyticsService';
import { ReportTotals } from '../services/reportsService';
import { useSubscription } from '../hooks/useSubscription';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import { useNavigate } from 'react-router-dom';

interface AIDashboardSummaryProps {
  currentMonthStats: ReportTotals;
  previousMonthStats?: ReportTotals;
  topCustomers?: Array<{ name: string; total: number }>;
  topProducts?: Array<{ name: string; quantity: number }>;
}

export default function AIDashboardSummary({
  currentMonthStats,
  previousMonthStats,
  topCustomers,
  topProducts,
}: AIDashboardSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasCheckedRef = useRef(false);
  const lastInvoiceCountRef = useRef<number | null>(null);
  const { checkAction, trackUsage } = useSubscription();
  const navigate = useNavigate();

  const generateSummary = useCallback(async () => {
    // Check subscription limits
    const canGenerate = await checkAction('aiSummary');
    if (!canGenerate.allowed) {
      setError(canGenerate.reason || 'Subscription limit reached');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const aiSummary = await generateDashboardSummary({
        ...currentMonthStats,
        previousMonthStats,
        topCustomers,
        topProducts,
      });
      setSummary(aiSummary);
      
      // Track AI usage
      await trackUsage('aiSummary');
      
      // Store the current invoice count after successful generation
      const storageKey = 'last_dashboard_invoice_count';
      localStorage.setItem(storageKey, (currentMonthStats.invoice_count || 0).toString());
      lastInvoiceCountRef.current = currentMonthStats.invoice_count || 0;
      
      // Also save the summary
      localStorage.setItem('last_dashboard_summary', aiSummary);
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary');
      console.error('Error generating summary:', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonthStats, previousMonthStats, topCustomers, topProducts, checkAction, trackUsage]);

  useEffect(() => {
    // Only auto-generate if there's a new sale (invoice count increased)
    const storageKey = 'last_dashboard_invoice_count';
    const lastInvoiceCount = localStorage.getItem(storageKey);
    const currentInvoiceCount = currentMonthStats.invoice_count || 0;
    
    // Initialize lastInvoiceCountRef if not set
    if (lastInvoiceCountRef.current === null) {
      if (lastInvoiceCount !== null) {
        lastInvoiceCountRef.current = parseInt(lastInvoiceCount, 10);
      } else {
        lastInvoiceCountRef.current = currentInvoiceCount;
        // First time - if there are invoices, generate summary
        if (currentInvoiceCount > 0) {
          generateSummary();
          return;
        } else {
          // No invoices yet, try to load saved summary
          const savedSummary = localStorage.getItem('last_dashboard_summary');
          if (savedSummary) {
            setSummary(savedSummary);
          }
          return;
        }
      }
    }
    
    // Check if invoice count increased (new sale)
    if (currentInvoiceCount > lastInvoiceCountRef.current) {
      // New sale detected - generate new summary
      generateSummary();
      lastInvoiceCountRef.current = currentInvoiceCount;
    } else if (!summary && currentInvoiceCount === lastInvoiceCountRef.current) {
      // No new sales, load previous summary if available
      const savedSummary = localStorage.getItem('last_dashboard_summary');
      if (savedSummary) {
        setSummary(savedSummary);
      }
    }
  }, [currentMonthStats.invoice_count, generateSummary, summary]);

  if (error && !summary) {
    const isLimitError = error.includes('limit') || error.includes('reached');
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Summary
          </h2>
          {!isLimitError && (
            <Button variant="ghost" size="sm" onClick={generateSummary} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Retry'}
            </Button>
          )}
        </div>
        <div className="flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p>{error}</p>
            {isLimitError && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/billing')}
              >
                Upgrade Plan
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow p-6 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Summary of Your Month
        </h2>
        <Button variant="ghost" size="sm" onClick={generateSummary} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </Button>
      </div>
      {loading && !summary ? (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Generating insights...</span>
        </div>
      ) : (
        <p className="text-gray-700 leading-relaxed">{summary || 'No summary available'}</p>
      )}
    </div>
  );
}


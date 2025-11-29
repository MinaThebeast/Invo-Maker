import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Package, FileText, DollarSign, Sparkles } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { useInvoices } from '../hooks/useInvoices';
// Removed unused imports: useCustomers, useProducts
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AIQuickInvoice from '../components/AIQuickInvoice';
import AIDashboardSummary from '../components/AIDashboardSummary';
import LowStockAlert from '../components/LowStockAlert';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_invoiced: 0,
    total_paid: 0,
    total_outstanding: 0,
    invoice_count: 0,
    paid_count: 0,
    overdue_count: 0,
  });
  const [previousMonthStats, setPreviousMonthStats] = useState<{
    total_invoiced: number;
    total_paid: number;
    total_outstanding: number;
    invoice_count: number;
    paid_count: number;
    overdue_count: number;
  }>();
  const { loading, getTotals } = useReports();
  const { invoices } = useInvoices();
  const navigate = useNavigate();
  const [showAIQuickInvoice, setShowAIQuickInvoice] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const totals = await getTotals(startOfMonth);
        setStats(totals);

        // Get previous month stats
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfLastMonth = lastMonth.toISOString().split('T')[0];
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        const prevTotals = await getTotals(startOfLastMonth, endOfLastMonth);
        setPreviousMonthStats({
          total_invoiced: prevTotals.total_invoiced,
          total_paid: prevTotals.total_paid,
          total_outstanding: prevTotals.total_outstanding || 0,
          invoice_count: prevTotals.invoice_count || 0,
          paid_count: prevTotals.paid_count || 0,
          overdue_count: prevTotals.overdue_count || 0,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, [getTotals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Invoiced',
      value: `$${stats?.total_invoiced.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Paid',
      value: `$${stats?.total_paid.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Outstanding',
      value: `$${stats?.total_outstanding.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      title: 'Overdue Invoices',
      value: stats?.overdue_count || 0,
      icon: FileText,
      color: 'bg-red-500',
    },
  ];

  const quickActions = [
    {
      title: 'Create Invoice',
      icon: Plus,
      onClick: () => navigate('/invoices/new'),
      color: 'bg-primary-600 hover:bg-primary-700',
    },
    {
      title: 'Add Customer',
      icon: Users,
      onClick: () => navigate('/customers'),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'Add Product',
      icon: Package,
      onClick: () => navigate('/products'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Dashboard Summary */}
      <AIDashboardSummary
        currentMonthStats={stats}
        previousMonthStats={previousMonthStats}
        topCustomers={(() => {
          const customerTotals = new Map<string, { name: string; total: number }>();
          invoices.forEach((inv) => {
            if (inv.customer_id && inv.customer) {
              const current = customerTotals.get(inv.customer_id) || { name: inv.customer.name, total: 0 };
              current.total += inv.total;
              customerTotals.set(inv.customer_id, current);
            }
          });
          return Array.from(customerTotals.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);
        })()}
        topProducts={(() => {
          const productCounts = new Map<string, { name: string; quantity: number }>();
          invoices.forEach((inv) => {
            inv.items?.forEach((item) => {
              if (item.product_id && item.product) {
                const current = productCounts.get(item.product_id) || {
                  name: item.product.name,
                  quantity: 0,
                };
                current.quantity += item.quantity;
                productCounts.set(item.product_id, current);
              }
            });
          });
          return Array.from(productCounts.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 3);
        })()}
      />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowAIQuickInvoice(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">AI Quick Invoice</span>
          </button>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={action.onClick}
                className={`${action.color} text-white p-4 rounded-lg flex items-center justify-center gap-2 transition-colors`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{action.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AIQuickInvoice
        isOpen={showAIQuickInvoice}
        onClose={() => setShowAIQuickInvoice(false)}
      />
    </div>
  );
}


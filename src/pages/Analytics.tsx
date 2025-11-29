import { useState, useEffect } from 'react';
import { useReports } from '../hooks/useReports';
import { useInvoices } from '../hooks/useInvoices';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Users, 
  Package,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function Analytics() {
  const { getTotals } = useReports();
  const { invoices } = useInvoices();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear'>('thisMonth');
  const [currentStats, setCurrentStats] = useState({
    total_invoiced: 0,
    total_paid: 0,
    total_outstanding: 0,
    invoice_count: 0,
    paid_count: 0,
    overdue_count: 0,
  });
  const [previousStats, setPreviousStats] = useState({
    total_invoiced: 0,
    total_paid: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, getTotals]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;

      switch (dateRange) {
        case 'thisMonth':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'lastMonth':
          startDate = startOfMonth(subMonths(now, 1));
          endDate = endOfMonth(subMonths(now, 1));
          break;
        case 'last3Months':
          startDate = startOfMonth(subMonths(now, 2));
          endDate = endOfMonth(now);
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = endOfMonth(now);
          break;
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
      }

      const current = await getTotals(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setCurrentStats(current);

      // Get previous period for comparison
      if (dateRange === 'thisMonth') {
        const prevStart = startOfMonth(subMonths(now, 1));
        const prevEnd = endOfMonth(subMonths(now, 1));
        const previous = await getTotals(
          prevStart.toISOString().split('T')[0],
          prevEnd.toISOString().split('T')[0]
        );
        setPreviousStats({
          total_invoiced: previous.total_invoiced,
          total_paid: previous.total_paid,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueGrowth = calculateGrowth(currentStats.total_invoiced, previousStats.total_invoiced);
  const paidGrowth = calculateGrowth(currentStats.total_paid, previousStats.total_paid);

  // Top customers by revenue
  const topCustomers = customers
    .map((customer) => {
      const customerInvoices = invoices.filter((inv) => inv.customer_id === customer.id);
      const totalRevenue = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
      return {
        ...customer,
        totalRevenue,
        invoiceCount: customerInvoices.length,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // Top products by quantity sold
  const topProducts = products
    .map((product) => {
      let totalQuantity = 0;
      invoices.forEach((invoice) => {
        invoice.items?.forEach((item) => {
          if (item.product_id === product.id) {
            totalQuantity += item.quantity;
          }
        });
      });
      return {
        ...product,
        totalQuantity,
      };
    })
    .filter((p) => p.totalQuantity > 0)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);

  // Invoice status distribution
  const statusDistribution = {
    draft: invoices.filter((inv) => inv.status === 'draft').length,
    sent: invoices.filter((inv) => inv.status === 'sent').length,
    paid: invoices.filter((inv) => inv.status === 'paid').length,
    partial: invoices.filter((inv) => inv.status === 'partial').length,
    overdue: invoices.filter((inv) => inv.status === 'overdue').length,
    cancelled: invoices.filter((inv) => inv.status === 'cancelled').length,
  };

  // Monthly revenue trend (last 6 months)
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.issue_date);
      return invDate >= monthStart && invDate <= monthEnd;
    });
    return {
      month: format(month, 'MMM yyyy'),
      revenue: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
      count: monthInvoices.length,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invoiced</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${currentStats.total_invoiced.toFixed(2)}
              </p>
              {dateRange === 'thisMonth' && previousStats.total_invoiced > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {revenueGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              )}
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${currentStats.total_paid.toFixed(2)}
              </p>
              {dateRange === 'thisMonth' && previousStats.total_paid > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {paidGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      paidGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(paidGrowth).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              )}
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${currentStats.total_outstanding.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {currentStats.overdue_count} overdue
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Invoices</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {currentStats.invoice_count}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {currentStats.paid_count} paid
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Top Customers</h2>
          </div>
          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">
                        {customer.invoiceCount} invoice{customer.invoiceCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${customer.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No customer data available</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
          </div>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        ${product.price.toFixed(2)} per {product.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {product.totalQuantity} {product.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No product sales data available</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Invoice Status</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const total = Object.values(statusDistribution).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const statusColors: Record<string, string> = {
                draft: 'bg-gray-500',
                sent: 'bg-blue-500',
                paid: 'bg-green-500',
                partial: 'bg-yellow-500',
                overdue: 'bg-red-500',
                cancelled: 'bg-gray-400',
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${statusColors[status]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
          </div>
          <div className="space-y-3">
            {monthlyTrend.map((month, index) => {
              const maxRevenue = Math.max(...monthlyTrend.map((m) => m.revenue), 1);
              const barWidth = (month.revenue / maxRevenue) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <span className="text-sm text-gray-600">
                      ${month.revenue.toFixed(2)} ({month.count} invoices)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


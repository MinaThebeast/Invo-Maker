import { supabase } from '../lib/supabase';
import { Invoice } from '../types';

export interface ReportTotals {
  total_invoiced: number;
  total_paid: number;
  total_outstanding: number;
  invoice_count: number;
  paid_count: number;
  overdue_count: number;
}

/**
 * Get totals for a date range
 */
export async function getReportTotals(
  fromDate?: string,
  toDate?: string
): Promise<ReportTotals> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        total_invoiced: 0,
        total_paid: 0,
        total_outstanding: 0,
        invoice_count: 0,
        paid_count: 0,
        overdue_count: 0,
      };
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!business) {
      return {
        total_invoiced: 0,
        total_paid: 0,
        total_outstanding: 0,
        invoice_count: 0,
        paid_count: 0,
        overdue_count: 0,
      };
    }

    let query = supabase
      .from('invoices')
      .select('total, paid_amount, balance, status, due_date')
      .eq('business_id', business.id);

    if (fromDate) {
      query = query.gte('issue_date', fromDate);
    }

    if (toDate) {
      query = query.lte('issue_date', toDate);
    }

    const { data: invoices, error } = await query;

    if (error) throw error;

    const invoiceList = invoices || [];
    const today = new Date().toISOString().split('T')[0];

    const totals: ReportTotals = {
      total_invoiced: invoiceList.reduce((sum, inv) => sum + (inv.total || 0), 0),
      total_paid: invoiceList.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0),
      total_outstanding: invoiceList.reduce((sum, inv) => sum + (inv.balance || 0), 0),
      invoice_count: invoiceList.length,
      paid_count: invoiceList.filter((inv) => inv.status === 'paid').length,
      overdue_count: invoiceList.filter(
        (inv) =>
          inv.status !== 'paid' &&
          inv.status !== 'cancelled' &&
          inv.due_date < today
      ).length,
    };

    return totals;
  } catch (error) {
    console.error('Error getting report totals:', error);
    throw error;
  }
}

/**
 * Get invoices list with filters for reports
 */
export async function getInvoicesForReport(filters: {
  status?: string;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<Invoice[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!business) return [];

    let query = supabase
      .from('invoices')
      .select('*, customer:customers(*)')
      .eq('business_id', business.id);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    if (filters.fromDate) {
      query = query.gte('issue_date', filters.fromDate);
    }

    if (filters.toDate) {
      query = query.lte('issue_date', filters.toDate);
    }

    const { data, error } = await query.order('issue_date', { ascending: false });

    if (error) throw error;
    return (data || []) as Invoice[];
  } catch (error) {
    console.error('Error getting invoices for report:', error);
    throw error;
  }
}


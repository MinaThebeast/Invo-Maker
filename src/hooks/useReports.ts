import { useState, useCallback } from 'react';
import * as reportsService from '../services/reportsService';
import { Invoice } from '../types';

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getTotals = useCallback(
    async (fromDate?: string, toDate?: string) => {
      try {
        setLoading(true);
        setError(null);
        return await reportsService.getReportTotals(fromDate, toDate);
      } catch (err) {
        setError(err as Error);
        console.error('Error getting report totals:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getInvoicesForReport = useCallback(
    async (filters: {
      status?: string;
      customerId?: string;
      fromDate?: string;
      toDate?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);
        return await reportsService.getInvoicesForReport(filters);
      } catch (err) {
        setError(err as Error);
        console.error('Error getting invoices for report:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    getTotals,
    getInvoicesForReport,
  };
}


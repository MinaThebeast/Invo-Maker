import { useState, useEffect, useCallback } from 'react';
import * as invoiceService from '../services/invoiceService';
import { Invoice, InvoiceItem } from '../types';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoiceService.getInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const getFilteredInvoices = useCallback(
    async (filters: {
      status?: string;
      customerId?: string;
      fromDate?: string;
      toDate?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);
        const data = await invoiceService.getInvoicesFiltered(filters);
        setInvoices(data);
      } catch (err) {
        setError(err as Error);
        console.error('Error loading filtered invoices:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createInvoice = useCallback(
    async (invoiceData: {
      customer_id?: string;
      issue_date: string;
      due_date: string;
      status?: string;
      currency?: string;
      notes?: string;
      terms?: string;
      items: Partial<InvoiceItem>[];
    }) => {
      try {
        setError(null);
        const newInvoice = await invoiceService.createInvoice(invoiceData);
        setInvoices((prev) => [newInvoice, ...prev]);
        return newInvoice;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  const updateInvoice = useCallback(
    async (
      id: string,
      updates: {
        customer_id?: string;
        issue_date?: string;
        due_date?: string;
        status?: string;
        currency?: string;
        notes?: string;
        terms?: string;
        items?: Partial<InvoiceItem>[];
      }
    ) => {
      try {
        setError(null);
        const updated = await invoiceService.updateInvoice(id, updates);
        setInvoices((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
        return updated;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      setError(null);
      await invoiceService.deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const duplicateInvoice = useCallback(async (id: string) => {
    try {
      setError(null);
      const duplicated = await invoiceService.duplicateInvoice(id);
      setInvoices((prev) => [duplicated, ...prev]);
      return duplicated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    invoices,
    loading,
    error,
    refetch: loadInvoices,
    getFilteredInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    duplicateInvoice,
  };
}

export function useInvoice(id: string | undefined) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadInvoice = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await invoiceService.getInvoiceById(id);
      setInvoice(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading invoice:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  return { invoice, loading, error, refetch: loadInvoice };
}


import { useState, useEffect, useCallback } from 'react';
import * as customerService from '../services/customerService';
import { Customer, Invoice } from '../types';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const searchCustomers = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.searchCustomers(query);
      setCustomers(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error searching customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = useCallback(
    async (customerData: Omit<Customer, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
      try {
        setError(null);
        const newCustomer = await customerService.createCustomer(customerData);
        setCustomers((prev) => [newCustomer, ...prev]);
        return newCustomer;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  const updateCustomer = useCallback(
    async (id: string, updates: Partial<Omit<Customer, 'id' | 'business_id' | 'created_at' | 'updated_at'>>) => {
      try {
        setError(null);
        const updated = await customerService.updateCustomer(id, updates);
        setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
        return updated;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      setError(null);
      await customerService.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    customers,
    loading,
    error,
    refetch: loadCustomers,
    searchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}

export function useCustomer(id: string | undefined) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadCustomer = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await customerService.getCustomerWithInvoices(id);
        if (data) {
          setCustomer(data.customer);
          setInvoices(data.invoices);
        }
      } catch (err) {
        setError(err as Error);
        console.error('Error loading customer:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id]);

  return { customer, invoices, loading, error };
}


import { useState, useEffect, useCallback } from 'react';
import * as paymentService from '../services/paymentService';
import { Payment } from '../types';

export function usePayments(invoiceId: string | undefined) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPayments = useCallback(async () => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getPaymentsByInvoice(invoiceId);
      setPayments(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const addPayment = useCallback(
    async (paymentData: {
      amount: number;
      payment_date: string;
      payment_method: Payment['payment_method'];
      reference?: string;
      notes?: string;
    }) => {
      if (!invoiceId) throw new Error('Invoice ID required');

      try {
        setError(null);
        const newPayment = await paymentService.addPayment(invoiceId, paymentData);
        setPayments((prev) => [newPayment, ...prev]);
        return newPayment;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [invoiceId]
  );

  const updatePayment = useCallback(
    async (id: string, updates: Partial<Omit<Payment, 'id' | 'invoice_id' | 'created_at' | 'updated_at'>>) => {
      try {
        setError(null);
        const updated = await paymentService.updatePayment(id, updates);
        setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return updated;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  const deletePayment = useCallback(async (id: string) => {
    try {
      setError(null);
      await paymentService.deletePayment(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    payments,
    loading,
    error,
    refetch: loadPayments,
    addPayment,
    updatePayment,
    deletePayment,
  };
}


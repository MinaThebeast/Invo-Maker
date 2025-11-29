import { useState } from 'react';
import { usePayments } from '../hooks/usePayments';
import { Payment } from '../types';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  onSuccess?: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  invoiceId,
  onSuccess,
}: PaymentModalProps) {
  const { addPayment } = usePayments(invoiceId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash' as Payment['payment_method'],
    reference: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addPayment({
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
      });
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference: '',
        notes: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Payment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        />
        <Input
          label="Payment Date"
          type="date"
          required
          value={formData.payment_date}
          onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
        />
        <Select
          label="Payment Method"
          required
          value={formData.payment_method}
          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as Payment['payment_method'] })}
          options={[
            { value: 'cash', label: 'Cash' },
            { value: 'card', label: 'Card' },
            { value: 'bank_transfer', label: 'Bank Transfer' },
            { value: 'check', label: 'Check' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <Input
          label="Reference"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          placeholder="Transaction ID, check number, etc."
        />
        <Textarea
          label="Notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Add Payment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


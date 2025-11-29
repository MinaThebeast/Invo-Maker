import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import { useInvoices } from '../hooks/useInvoices';
import { createInvoiceFromDescription } from '../services/aiService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import LoadingSpinner from './ui/LoadingSpinner';
import { Sparkles } from 'lucide-react';

interface AIQuickInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIQuickInvoice({ isOpen, onClose }: AIQuickInvoiceProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { createInvoice } = useInvoices();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Call AI service to parse description
      const aiResult = await createInvoiceFromDescription(
        description,
        customers.map((c) => ({ id: c.id, name: c.name })),
        products.map((p) => ({ id: p.id, name: p.name, price: p.price }))
      );

      // Calculate due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (aiResult.dueDays || 30));

      // Create invoice
      const invoice = await createInvoice({
        customer_id: aiResult.customerId,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        status: 'draft',
        items: aiResult.items.map((item) => ({
          product_id: item.productId,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: 0,
          discount: 0,
          line_total: item.quantity * item.unitPrice,
        })),
        notes: aiResult.notes,
      });

      // Navigate to invoice editor
      navigate(`/invoices/${invoice.id}/edit`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice from description');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Quick Invoice" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Describe the invoice you want to create. For example:
            <br />
            <em className="text-gray-500">
              "Invoice John for 3 AC cleanings at $80 each and 1 filter replacement at $30, due in 10 days"
            </em>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Textarea
          label="Invoice Description"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Invoice John for 3 AC cleanings at $80 each and 1 filter at $30, due in 10 days"
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !description.trim()}>
            {loading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Creating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Invoice
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


import { useState, useEffect } from 'react';
import { generateEmailDraft } from '../services/aiService';
import { generateOverdueReminder } from '../services/aiAnalyticsService';
import { Invoice } from '../types';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';
import TranslationHelper from './TranslationHelper';
import { Sparkles, Mail } from 'lucide-react';

interface AIEmailDraftProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSend?: (subject: string, body: string, recipientEmail: string) => void;
}

export default function AIEmailDraft({
  isOpen,
  onClose,
  invoice,
  onSend,
}: AIEmailDraftProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(invoice.customer?.email || '');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<'new' | 'overdue' | 'reminder'>('new');

  useEffect(() => {
    if (isOpen && invoice) {
      // Determine context
      const today = new Date();
      const dueDate = new Date(invoice.due_date);
      if (dueDate < today && invoice.balance > 0) {
        setContext('overdue');
      } else if (invoice.balance > 0) {
        setContext('reminder');
      } else {
        setContext('new');
      }

      // Generate draft
      generateDraft();
    }
  }, [isOpen, invoice]);

  const generateDraft = async () => {
    if (!invoice) return;

    setLoading(true);
    try {
      // Use smart overdue reminder if overdue, otherwise regular draft
      const today = new Date();
      const dueDate = new Date(invoice.due_date);
      const isOverdue = dueDate < today && invoice.balance > 0;

      if (isOverdue && invoice.customer) {
        // Get customer history for smart reminder
        try {
          const reminder = await generateOverdueReminder(
            invoice,
            invoice.customer,
            {
              averageDaysLate: 5, // Would calculate from actual history
              latePaymentCount: 0, // Would get from actual history
              totalInvoices: 1, // Would get from actual history
            }
          );
          setSubject(reminder.subject);
          setBody(reminder.body);
          setContext(reminder.tone === 'final' ? 'overdue' : reminder.tone === 'firm' ? 'reminder' : 'new');
        } catch (error) {
          // Fallback to regular draft
          const draft = await generateEmailDraft(
            {
              invoiceNumber: invoice.invoice_number,
              amount: invoice.total,
              dueDate: new Date(invoice.due_date).toLocaleDateString(),
              customerName: invoice.customer?.name || 'Customer',
              balance: invoice.balance,
            },
            context
          );
          setSubject(draft.subject);
          setBody(draft.body);
        }
      } else {
        const draft = await generateEmailDraft(
          {
            invoiceNumber: invoice.invoice_number,
            amount: invoice.total,
            dueDate: new Date(invoice.due_date).toLocaleDateString(),
            customerName: invoice.customer?.name || 'Customer',
            balance: invoice.balance,
          },
          context
        );
        setSubject(draft.subject);
        setBody(draft.body);
      }
    } catch (error: any) {
      console.error('Error generating email draft:', error);
      // Fallback
      setSubject(`Invoice ${invoice.invoice_number}`);
      setBody(
        `Dear ${invoice.customer?.name || 'Customer'},\n\nPlease find attached invoice #${invoice.invoice_number}.\n\nAmount: $${invoice.total.toFixed(2)}\nDue Date: ${new Date(invoice.due_date).toLocaleDateString()}\n\nThank you!`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (onSend && recipientEmail) {
      onSend(subject, body, recipientEmail);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Invoice Email" size="lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              AI-generated email draft. Edit as needed before sending.
            </p>
            {context !== 'new' && (
              <p className="text-xs text-amber-600 mt-1">
                {context === 'overdue' ? 'Overdue invoice' : 'Payment reminder'}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateDraft}
            disabled={loading}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner />
            <span className="ml-2 text-sm text-gray-600">Generating email...</span>
          </div>
        )}

        <Input
          label="To"
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          required
        />

        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        <div>
          <Textarea
            label="Message"
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          <div className="mt-2">
            <TranslationHelper
              text={body}
              onTranslated={(translated) => setBody(translated)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!recipientEmail || !subject || !body}>
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>
    </Modal>
  );
}


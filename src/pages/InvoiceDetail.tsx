import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Mail, Plus, MessageSquare, Bell } from 'lucide-react';
import { useInvoice } from '../hooks/useInvoices';
import { usePayments } from '../hooks/usePayments';
import { useBusiness } from '../hooks/useBusiness';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PaymentModal from '../components/PaymentModal';
import AIEmailDraft from '../components/AIEmailDraft';
import { downloadInvoicePDF } from '../services/pdfService';
import { sendInvoiceEmailFallback, sendInvoiceEmail } from '../services/emailService';
import { sendInvoiceSMS } from '../services/smsService';
import { format } from 'date-fns';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoice, loading, refetch } = useInvoice(id);
  const { payments } = usePayments(id);
  const { business } = useBusiness();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [_sendingEmail, setSendingEmail] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setDownloadingPDF(true);
    try {
      await downloadInvoicePDF(invoice, business, invoice.customer || null);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    if (!invoice) return;
    setShowEmailModal(true);
  };

  const handleSendSMS = async () => {
    if (!invoice || !invoice.customer?.phone) {
      alert('Customer phone number is required to send SMS');
      return;
    }
    setSendingSMS(true);
    try {
      await sendInvoiceSMS(invoice, invoice.customer.phone);
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS');
    } finally {
      setSendingSMS(false);
    }
  };

  const handleEmailSend = async (subject: string, body: string, recipientEmail: string) => {
    if (!invoice) return;
    setSendingEmail(true);
    try {
      // Try to use email service, fallback to mailto
      try {
        await sendInvoiceEmail(invoice, recipientEmail, subject, body);
        alert('Email sent successfully!');
      } catch (error) {
        // Fallback to mailto with AI-generated content
        await sendInvoiceEmailFallback(invoice, recipientEmail, subject, body);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendReminder = async () => {
    if (!invoice || !invoice.customer?.email) {
      alert('Customer email is required to send reminder');
      return;
    }
    setSendingReminder(true);
    try {
      const today = new Date();
      const dueDate = new Date(invoice.due_date);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const subject = daysOverdue > 0 
        ? `Reminder: Overdue Invoice ${invoice.invoice_number} - ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`
        : `Reminder: Invoice ${invoice.invoice_number} - Payment Due Soon`;
      
      const body = `Dear ${invoice.customer.name || 'Customer'},

This is a friendly reminder regarding invoice #${invoice.invoice_number}.

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Issue Date: ${format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
- Due Date: ${format(new Date(invoice.due_date), 'MMM dd, yyyy')}
- Total Amount: ${invoice.currency} ${invoice.total.toFixed(2)}
${invoice.balance > 0 ? `- Balance Due: ${invoice.currency} ${invoice.balance.toFixed(2)}` : ''}
${daysOverdue > 0 ? `\n⚠️ This invoice is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue.` : ''}

Please make payment at your earliest convenience. If you have already made payment, please disregard this reminder.

Thank you for your business!

Best regards,
${business?.name || 'Your Business'}
${business?.phone ? `\nPhone: ${business.phone}` : ''}
${business?.email ? `\nEmail: ${business.email}` : ''}
${business?.website ? `\nWebsite: ${business.website}` : ''}`;

      // Try to use email service, fallback to mailto
      try {
        await sendInvoiceEmail(invoice, invoice.customer.email, subject, body);
        alert('Reminder sent successfully!');
      } catch (error) {
        // Fallback to mailto
        await sendInvoiceEmailFallback(invoice, invoice.customer.email, subject, body);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Invoice not found</p>
        <Button onClick={() => navigate('/invoices')} className="mt-4">
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => navigate('/invoices')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={() => navigate(`/invoices/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF} disabled={downloadingPDF}>
            <Download className="w-4 h-4 mr-2" />
            {downloadingPDF ? 'Generating...' : 'PDF'}
          </Button>
          <Button variant="outline" onClick={handleSendEmail} disabled={!invoice.customer?.email}>
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSendReminder} 
            disabled={!invoice.customer?.email || sendingReminder || invoice.balance <= 0}
            title={invoice.balance <= 0 ? 'Invoice is fully paid' : 'Send payment reminder'}
          >
            <Bell className="w-4 h-4 mr-2" />
            {sendingReminder ? 'Sending...' : 'Send Reminder'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSendSMS} 
            disabled={!invoice.customer?.phone || sendingSMS}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {sendingSMS ? 'Sending...' : 'Send SMS'}
          </Button>
          <Button onClick={() => setShowPaymentModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
        </div>
      </div>

      {/* Payments Section */}
      {payments && payments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Method</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Amount</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="py-3 text-sm">
                      {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 text-sm capitalize">{payment.payment_method}</td>
                    <td className="py-3 text-sm text-right font-medium">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="py-3 text-sm text-gray-500">{payment.reference || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoiceId={id || ''}
        onSuccess={() => {
          refetch();
        }}
      />

      {invoice && (
        <AIEmailDraft
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          invoice={invoice}
          onSend={handleEmailSend}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Items */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
            {invoice.items && invoice.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Item</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-700">Qty</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-700">Price</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">{item.description}</div>
                          )}
                        </td>
                        <td className="text-right py-3">{item.quantity}</td>
                        <td className="text-right py-3">${item.unit_price.toFixed(2)}</td>
                        <td className="text-right py-3 font-medium">${item.line_total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No items</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium">${invoice.subtotal.toFixed(2)}</dd>
              </div>
              {invoice.tax_total > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Tax</dt>
                  <dd className="text-sm font-medium">${invoice.tax_total.toFixed(2)}</dd>
                </div>
              )}
              {invoice.discount_total > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Discount</dt>
                  <dd className="text-sm font-medium">-${invoice.discount_total.toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <dt className="text-base font-semibold">Total</dt>
                <dd className="text-base font-bold">${invoice.total.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Paid</dt>
                <dd className="text-sm font-medium text-green-600">
                  ${invoice.paid_amount.toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <dt className="text-sm font-semibold">Balance</dt>
                <dd className="text-sm font-bold">${invoice.balance.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          {/* Invoice Info */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-600">Status</dt>
                <dd className="font-medium capitalize">{invoice.status}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Issue Date</dt>
                <dd className="font-medium">
                  {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Due Date</dt>
                <dd className="font-medium">
                  {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                </dd>
              </div>
              {invoice.customer && (
                <div>
                  <dt className="text-gray-600">Customer</dt>
                  <dd className="font-medium">{invoice.customer.name}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}


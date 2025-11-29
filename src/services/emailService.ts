import { supabase } from '../lib/supabase';
import { Invoice } from '../types';
import { generateInvoicePDF } from './pdfService';
import * as businessService from './businessService';
import * as customerService from './customerService';

/**
 * Send invoice via email
 * Note: This is a placeholder. In production, you'd use:
 * - Supabase Edge Functions with a service like Resend, SendGrid, or AWS SES
 * - Or a dedicated email service API
 */
export async function sendInvoiceEmail(
  invoice: Invoice,
  recipientEmail: string,
  subject?: string,
  message?: string
): Promise<void> {
  try {
    // Get business and customer data
    const business = await businessService.getBusiness();
    const customer = invoice.customer_id
      ? await customerService.getCustomerById(invoice.customer_id)
      : null;

    // Generate PDF
    const pdfBlob = await generateInvoicePDF(invoice, business, customer);

    // Convert blob to base64 for email attachment
    const pdfBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(pdfBlob);
    });

    // For now, we'll use a Supabase Edge Function
    // You'll need to create this function in your Supabase project
    const { error } = await supabase.functions.invoke('send-invoice-email', {
      body: {
        to: recipientEmail,
        subject: subject || `Invoice ${invoice.invoice_number} from ${business?.name || 'Your Business'}`,
        message:
          message ||
          `Dear ${customer?.name || 'Customer'},

Please find attached invoice #${invoice.invoice_number} for your records.

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}
- Due Date: ${new Date(invoice.due_date).toLocaleDateString()}
- Total Amount: $${invoice.total.toFixed(2)}
${invoice.balance > 0 ? `- Balance Due: $${invoice.balance.toFixed(2)}` : ''}

Thank you for your business!

Best regards,
${business?.name || 'Your Business'}`,
        pdfBase64,
        pdfFileName: `Invoice-${invoice.invoice_number}.pdf`,
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Simple email sending using mailto link (fallback)
 */
export async function sendInvoiceEmailFallback(
  invoice: Invoice,
  customerEmail?: string,
  subject?: string,
  body?: string
): Promise<void> {
  // Get business info for signature
  const business = await businessService.getBusiness();
  
  // Use provided subject/body or create default
  const emailSubject = subject || `Invoice ${invoice.invoice_number}`;
  const emailBody = body || `Dear ${invoice.customer?.name || 'Customer'},

Please find invoice #${invoice.invoice_number} attached.

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}
- Due Date: ${new Date(invoice.due_date).toLocaleDateString()}
- Total Amount: ${invoice.currency} ${invoice.total.toFixed(2)}
${invoice.balance > 0 ? `- Balance Due: ${invoice.currency} ${invoice.balance.toFixed(2)}` : ''}

Thank you for your business!

Best regards,
${business?.name || 'Your Business'}
${business?.phone ? `\nPhone: ${business.phone}` : ''}
${business?.email ? `\nEmail: ${business.email}` : ''}
${business?.website ? `\nWebsite: ${business.website}` : ''}`;

  const encodedSubject = encodeURIComponent(emailSubject);
  const encodedBody = encodeURIComponent(emailBody);

  const mailtoLink = `mailto:${customerEmail || ''}?subject=${encodedSubject}&body=${encodedBody}`;
  window.location.href = mailtoLink;
}


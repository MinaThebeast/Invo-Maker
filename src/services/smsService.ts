import { Invoice } from '../types';
import * as businessService from './businessService';

/**
 * Send invoice via SMS/Text message
 * Uses mailto link with sms: protocol (works on mobile devices)
 * For web, falls back to phone number display
 */
export async function sendInvoiceSMS(
  invoice: Invoice,
  phoneNumber: string,
  message?: string
): Promise<void> {
  try {
    const business = await businessService.getBusiness();
    
    // Create SMS message
    const smsBody = message || `Hi ${invoice.customer?.name || 'Customer'},

Your invoice #${invoice.invoice_number} is ready.

Amount: ${invoice.currency} ${invoice.total.toFixed(2)}
Due: ${new Date(invoice.due_date).toLocaleDateString()}
${invoice.balance > 0 ? `Balance: ${invoice.currency} ${invoice.balance.toFixed(2)}` : ''}

View invoice: [Link would go here]

${business?.name || 'Your Business'}`;

    // Clean phone number (remove non-digits except +)
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    // Try SMS protocol (works on mobile)
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      const smsLink = `sms:${cleanPhone}?body=${encodeURIComponent(smsBody)}`;
      window.location.href = smsLink;
    } else {
      // For desktop, show phone number and message
      alert(`SMS to ${phoneNumber}:\n\n${smsBody}\n\n(Copy this message and send via your messaging app)`);
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}


// Import the callOpenAI function from aiService
// We'll define it here to avoid circular dependencies

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(
  prompt: string,
  systemPrompt?: string,
  temperature: number = 0.7
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}
import { Invoice, Customer } from '../types';

/**
 * Generate AI summary of dashboard stats
 */
export async function generateDashboardSummary(stats: {
  total_invoiced: number;
  total_paid: number;
  total_outstanding: number;
  invoice_count: number;
  paid_count: number;
  overdue_count: number;
  previousMonthStats?: {
    total_invoiced: number;
    total_paid: number;
  };
  topCustomers?: Array<{ name: string; total: number }>;
  topProducts?: Array<{ name: string; quantity: number }>;
}): Promise<string> {
  const systemPrompt = `You are an AI assistant that generates concise, insightful summaries of business financial data.
Create a friendly, professional summary (2-3 sentences) highlighting key insights.`;

  let prompt = `Generate a summary of this month's business performance:\n\n`;
  prompt += `Total Invoiced: $${stats.total_invoiced.toFixed(2)}\n`;
  prompt += `Total Paid: $${stats.total_paid.toFixed(2)}\n`;
  prompt += `Outstanding: $${stats.total_outstanding.toFixed(2)}\n`;
  prompt += `Invoices: ${stats.invoice_count} (${stats.paid_count} paid, ${stats.overdue_count} overdue)\n`;

  if (stats.previousMonthStats) {
    const growth = stats.total_invoiced - stats.previousMonthStats.total_invoiced;
    const growthPercent = stats.previousMonthStats.total_invoiced > 0
      ? ((growth / stats.previousMonthStats.total_invoiced) * 100).toFixed(1)
      : '0';
    prompt += `\nPrevious Month: $${stats.previousMonthStats.total_invoiced.toFixed(2)} invoiced\n`;
    prompt += `Growth: ${growthPercent}% ${growth >= 0 ? 'increase' : 'decrease'}\n`;
  }

  if (stats.topCustomers && stats.topCustomers.length > 0) {
    prompt += `\nTop Customer: ${stats.topCustomers[0].name} ($${stats.topCustomers[0].total.toFixed(2)})\n`;
  }

  if (stats.topProducts && stats.topProducts.length > 0) {
    prompt += `\nTop Product: ${stats.topProducts[0].name} (${stats.topProducts[0].quantity} sold)\n`;
  }

  prompt += `\nGenerate a concise, insightful summary.`;

  return await callOpenAI(prompt, systemPrompt, 0.7);
}

/**
 * Generate AI summary for a customer
 */
export async function generateCustomerSummary(
  customer: Customer,
  stats: {
    total_invoiced: number;
    total_paid: number;
    total_outstanding: number;
    invoice_count: number;
    paid_count: number;
    overdue_count: number;
    averageDaysToPay?: number;
    paymentHistory?: Array<{ date: string; daysLate: number }>;
  }
): Promise<string> {
  const systemPrompt = `You are an AI assistant that generates customer relationship summaries.
Create a professional, insightful summary (3-4 sentences) about the customer's payment behavior and relationship.`;

  let prompt = `Generate a summary for customer: ${customer.name}\n\n`;
  prompt += `Total Invoiced: $${stats.total_invoiced.toFixed(2)}\n`;
  prompt += `Total Paid: $${stats.total_paid.toFixed(2)}\n`;
  prompt += `Outstanding: $${stats.total_outstanding.toFixed(2)}\n`;
  prompt += `Invoices: ${stats.invoice_count} (${stats.paid_count} paid, ${stats.overdue_count} overdue)\n`;

  if (stats.averageDaysToPay !== undefined) {
    prompt += `Average Days to Pay: ${stats.averageDaysToPay.toFixed(1)} days\n`;
  }

  if (stats.paymentHistory && stats.paymentHistory.length > 0) {
    const latePayments = stats.paymentHistory.filter((p) => p.daysLate > 0).length;
    prompt += `Payment History: ${stats.paymentHistory.length} payments, ${latePayments} late\n`;
  }

  prompt += `\nGenerate an insightful summary about this customer's payment behavior and relationship.`;

  return await callOpenAI(prompt, systemPrompt, 0.7);
}

/**
 * Generate smart overdue reminder email
 */
export async function generateOverdueReminder(
  invoice: Invoice,
  customer: Customer | null,
  customerHistory: {
    averageDaysLate: number;
    latePaymentCount: number;
    totalInvoices: number;
  }
): Promise<{ subject: string; body: string; tone: 'friendly' | 'firm' | 'final' }> {
  const systemPrompt = `You are an AI assistant that generates payment reminder emails.
Adjust the tone based on customer payment history. Be professional but appropriate.`;

  const daysOverdue = Math.floor(
    (new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  let prompt = `Generate a payment reminder email for overdue invoice #${invoice.invoice_number}.\n\n`;
  prompt += `Customer: ${customer?.name || 'Customer'}\n`;
  prompt += `Amount: $${invoice.balance.toFixed(2)}\n`;
  prompt += `Days Overdue: ${daysOverdue}\n`;
  prompt += `Customer History:\n`;
  prompt += `- Average Days Late: ${customerHistory.averageDaysLate.toFixed(1)}\n`;
  prompt += `- Late Payments: ${customerHistory.latePaymentCount} of ${customerHistory.totalInvoices}\n`;

  // Determine tone based on history
  let tone: 'friendly' | 'firm' | 'final' = 'friendly';
  if (customerHistory.latePaymentCount / customerHistory.totalInvoices > 0.5) {
    tone = 'firm';
  }
  if (daysOverdue > 30 || customerHistory.averageDaysLate > 20) {
    tone = 'final';
  }

  prompt += `\nTone should be: ${tone}\n`;
  prompt += `Return JSON with "subject", "body", and "tone" fields.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt, 0.6);
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    return JSON.parse(jsonStr);
  } catch (error) {
    // Fallback
    const subject = `Payment Reminder: Invoice ${invoice.invoice_number}`;
    const body = `Dear ${customer?.name || 'Customer'},\n\nThis is a reminder that invoice #${invoice.invoice_number} for $${invoice.balance.toFixed(2)} is ${daysOverdue} days overdue.\n\nPlease arrange payment at your earliest convenience.\n\nThank you.`;
    return { subject, body, tone };
  }
}

/**
 * Translate text using AI
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'English'
): Promise<string> {
  const systemPrompt = `You are an AI assistant that translates text accurately while preserving meaning and tone.`;

  const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n"${text}"\n\nReturn only the translated text, no explanations.`;

  return await callOpenAI(prompt, systemPrompt, 0.3);
}

/**
 * Calculate late payment risk for a customer
 */
export function calculatePaymentRisk(customerStats: {
  totalInvoices: number;
  latePayments: number;
  averageDaysLate: number;
  currentOverdue: number;
}): {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  explanation: string;
} {
  const latePaymentRate = customerStats.totalInvoices > 0
    ? customerStats.latePayments / customerStats.totalInvoices
    : 0;

  let riskScore = 0;
  
  // Late payment rate (0-40 points)
  riskScore += latePaymentRate * 40;
  
  // Average days late (0-30 points)
  riskScore += Math.min(customerStats.averageDaysLate / 10, 1) * 30;
  
  // Current overdue amount (0-30 points)
  const overdueImpact = Math.min(customerStats.currentOverdue / 1000, 1);
  riskScore += overdueImpact * 30;

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (riskScore > 60) {
    riskLevel = 'high';
  } else if (riskScore > 30) {
    riskLevel = 'medium';
  }

  let explanation = '';
  if (riskLevel === 'high') {
    explanation = 'High risk: Frequent late payments and significant overdue amounts.';
  } else if (riskLevel === 'medium') {
    explanation = 'Medium risk: Some payment delays observed.';
  } else {
    explanation = 'Low risk: Generally pays on time.';
  }

  return {
    riskLevel,
    riskScore: Math.round(riskScore),
    explanation,
  };
}


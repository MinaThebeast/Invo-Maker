// AI Service using OpenAI API
// Make sure to set VITE_OPENAI_API_KEY in your .env file

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Unused interface - commented out
// interface AIResponse {
//   content: string;
//   structured?: any;
// }

/**
 * Call OpenAI API
 */
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
        model: 'gpt-4o-mini', // Using cheaper model, can upgrade to gpt-4 if needed
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

/**
 * Create invoice from natural language description
 */
export async function createInvoiceFromDescription(
  description: string,
  existingCustomers: Array<{ id: string; name: string }>,
  existingProducts: Array<{ id: string; name: string; price: number }>
): Promise<{
  customerName: string;
  customerId?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    productId?: string;
  }>;
  dueDays: number;
  notes?: string;
}> {
  const systemPrompt = `You are an AI assistant that helps create invoices from natural language descriptions.
Extract the following information:
1. Customer name
2. List of items with quantities and prices
3. Due date (in days from today, default to 30)
4. Optional notes

Return a JSON object with this structure:
{
  "customerName": "string",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "unitPrice": number
    }
  ],
  "dueDays": number,
  "notes": "string (optional)"
}

Match customer names and product names to existing data when possible.`;

  const existingCustomersList = existingCustomers.map((c) => c.name).join(', ');
  const existingProductsList = existingProducts.map((p) => `${p.name} ($${p.price})`).join(', ');

  const prompt = `Create an invoice from this description: "${description}"

Existing customers: ${existingCustomersList || 'None'}
Existing products: ${existingProductsList || 'None'}

Extract the invoice details and return JSON only.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt, 0.3);
    
    // Try to extract JSON from response
    let jsonStr = response.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Try to match customer
    if (parsed.customerName && existingCustomers.length > 0) {
      const matchedCustomer = existingCustomers.find(
        (c) => c.name.toLowerCase() === parsed.customerName.toLowerCase()
      );
      if (matchedCustomer) {
        parsed.customerId = matchedCustomer.id;
      }
    }
    
    // Try to match products
    if (parsed.items && existingProducts.length > 0) {
      parsed.items = parsed.items.map((item: any) => {
        const matchedProduct = existingProducts.find(
          (p) => p.name.toLowerCase() === item.name.toLowerCase()
        );
        if (matchedProduct) {
          item.productId = matchedProduct.id;
          item.unitPrice = matchedProduct.price; // Use actual product price
        }
        return item;
      });
    }
    
    return parsed;
  } catch (error) {
    console.error('Error creating invoice from description:', error);
    throw new Error('Failed to parse invoice description. Please try rephrasing.');
  }
}

/**
 * Generate notes or terms text
 */
export async function generateNotesOrTerms(
  type: 'notes' | 'terms',
  context: {
    invoiceAmount?: number;
    dueDate?: string;
    customerName?: string;
    tone?: 'polite' | 'professional' | 'firm' | 'friendly';
  }
): Promise<string> {
  const systemPrompt = `You are an AI assistant that generates professional invoice ${type} text.
Generate clear, professional, and appropriate text based on the context provided.`;

  let prompt = `Generate ${type} text for an invoice`;
  
  if (context.invoiceAmount) {
    prompt += ` with amount $${context.invoiceAmount.toFixed(2)}`;
  }
  if (context.dueDate) {
    prompt += `, due date: ${context.dueDate}`;
  }
  if (context.customerName) {
    prompt += `, for customer: ${context.customerName}`;
  }
  if (context.tone) {
    prompt += `. Tone should be ${context.tone}`;
  }
  
  prompt += '. Keep it concise (2-3 sentences).';

  return await callOpenAI(prompt, systemPrompt, 0.7);
}

/**
 * Generate email draft for sending invoice
 */
export async function generateEmailDraft(
  invoice: {
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    customerName: string;
    balance?: number;
  },
  context: 'new' | 'overdue' | 'reminder'
): Promise<{ subject: string; body: string }> {
  const systemPrompt = `You are an AI assistant that generates professional email drafts for invoices.
Create polite, clear, and professional emails.`;

  let prompt = `Generate an email to send invoice #${invoice.invoiceNumber} to ${invoice.customerName}.
Invoice amount: $${invoice.amount.toFixed(2)}, Due date: ${invoice.dueDate}`;

  if (context === 'overdue') {
    prompt += '. This invoice is overdue. Use a firm but professional tone.';
  } else if (context === 'reminder') {
    prompt += '. This is a payment reminder. Be polite but clear.';
  } else {
    prompt += '. This is a new invoice. Be friendly and professional.';
  }

  if (invoice.balance && invoice.balance > 0) {
    prompt += ` Balance due: $${invoice.balance.toFixed(2)}.`;
  }

  prompt += ' Return JSON with "subject" and "body" fields.';

  try {
    const response = await callOpenAI(prompt, systemPrompt, 0.7);
    
    // Extract JSON
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    // Fallback if JSON parsing fails
    const subject = `Invoice ${invoice.invoiceNumber} from ${invoice.customerName}`;
    const body = `Dear ${invoice.customerName},\n\nPlease find attached invoice #${invoice.invoiceNumber}.\n\nAmount: $${invoice.amount.toFixed(2)}\nDue Date: ${invoice.dueDate}\n\nThank you for your business!`;
    return { subject, body };
  }
}

/**
 * AI-powered search/query
 */
export async function queryInvoices(
  query: string,
  availableFilters: {
    statuses: string[];
    customers: Array<{ id: string; name: string }>;
    dateRanges: string[];
  }
): Promise<{
  status?: string;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
}> {
  const systemPrompt = `You are an AI assistant that converts natural language queries into structured filter objects for invoice searches.
Return JSON with filters: { status?, customerId?, fromDate?, toDate? }
Dates should be in YYYY-MM-DD format.
Status should be one of: ${availableFilters.statuses.join(', ')}`;

  const customersList = availableFilters.customers.map((c) => `${c.name} (${c.id})`).join(', ');

  const prompt = `Convert this query into invoice filters: "${query}"

Available customers: ${customersList}
Available statuses: ${availableFilters.statuses.join(', ')}

Return JSON only with the appropriate filters.`;

  try {
    const response = await callOpenAI(prompt, systemPrompt, 0.2);
    
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Validate and clean up
    if (parsed.status && !availableFilters.statuses.includes(parsed.status)) {
      delete parsed.status;
    }
    
    if (parsed.customerId) {
      const customer = availableFilters.customers.find((c) => c.id === parsed.customerId);
      if (!customer) {
        // Try to find by name
        const byName = availableFilters.customers.find(
          (c) => c.name.toLowerCase().includes(parsed.customerId?.toLowerCase() || '')
        );
        if (byName) {
          parsed.customerId = byName.id;
        } else {
          delete parsed.customerId;
        }
      }
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing query:', error);
    return {};
  }
}


// OCR Service for scanning invoices/receipts
// This is a placeholder - in production, you'd use:
// - Tesseract.js (client-side OCR)
// - Google Cloud Vision API
// - AWS Textract
// - Azure Computer Vision

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

/**
 * Extract text from image using OCR
 * Note: This is a simplified version using OpenAI Vision API
 * For production, use a dedicated OCR service
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
  // Convert image to base64
  const base64Image = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key required for OCR');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Can use gpt-4-vision-preview for better OCR
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text from this invoice/receipt image. Return the text in a structured format with: vendor name, date, items (name, quantity, price), total amount, and any other relevant information.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('OCR API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OCR error:', error);
    throw error;
  }
}

/**
 * Parse OCR text into structured invoice data
 */
export async function parseInvoiceFromOCR(ocrText: string): Promise<{
  vendorName?: string;
  date?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total?: number;
  tax?: number;
}> {
  const systemPrompt = `You are an AI assistant that parses invoice/receipt text into structured data.
Extract: vendor name, date, items (name, quantity, price), total, tax.
Return JSON only.`;

  const prompt = `Parse this invoice/receipt text into structured data:\n\n${ocrText}\n\nReturn JSON with: vendorName?, date?, items[], total?, tax?`;

  try {
    const response = await callOpenAI(prompt, systemPrompt, 0.2);
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing OCR text:', error);
    throw new Error('Failed to parse invoice from image');
  }
}


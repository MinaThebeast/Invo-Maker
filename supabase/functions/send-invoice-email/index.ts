// Supabase Edge Function for sending invoice emails
// This requires setting up an email service (Resend, SendGrid, etc.)
// 
// To deploy:
// 1. Install Supabase CLI: npm install -g supabase
// 2. Login: supabase login
// 3. Link project: supabase link --project-ref your-project-ref
// 4. Deploy: supabase functions deploy send-invoice-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  pdfBase64: string;
  pdfFileName: string;
}

serve(async (req) => {
  try {
    const { to, subject, message, pdfBase64, pdfFileName }: EmailRequest = await req.json();

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Convert base64 to buffer
    const pdfBuffer = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Invo Maker <invoices@yourdomain.com>', // Update with your domain
        to: [to],
        subject: subject,
        html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${message}</pre>`,
        attachments: [
          {
            filename: pdfFileName,
            content: Array.from(pdfBuffer),
          },
        ],
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});


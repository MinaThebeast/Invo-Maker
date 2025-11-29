# Send Invoice Email Edge Function

This Supabase Edge Function sends invoice emails with PDF attachments using Resend.

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

### 4. Set Environment Variables

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

### 5. Deploy Function

```bash
supabase functions deploy send-invoice-email
```

## Alternative: Use Other Email Services

You can modify the function to use:
- SendGrid
- AWS SES
- Mailgun
- Postmark

Just update the API call in `index.ts`.

## Testing

You can test the function locally:

```bash
supabase functions serve send-invoice-email
```

Then call it from your app or use the Supabase dashboard.


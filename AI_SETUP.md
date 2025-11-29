# AI Features Setup Guide

## Overview

INVO Maker includes powerful AI features powered by OpenAI. This guide will help you set them up.

## Prerequisites

1. An OpenAI account
2. An OpenAI API key

## Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

⚠️ **Important:** Keep your API key secret! Never commit it to version control.

## Step 2: Add API Key to Environment

1. Open your `.env` file (create it if it doesn't exist)
2. Add the following line:

```env
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

3. Save the file
4. **Restart your dev server** for changes to take effect

## Step 3: Verify Setup

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Try the AI Quick Invoice feature:
   - Go to Dashboard
   - Click "AI Quick Invoice"
   - Type: "Invoice John for 3 AC cleanings at $80 each"
   - If it works, you're all set!

## AI Features Available

### 1. AI Quick Invoice
- **Location:** Dashboard → "AI Quick Invoice" button
- **Usage:** Describe an invoice in natural language
- **Example:** "Invoice John for 3 AC cleanings at $80 each and 1 filter at $30, due in 10 days"

### 2. AI Text Helpers
- **Location:** Invoice Editor → Notes/Terms fields
- **Usage:** Click ✨ AI Assist button → Select tone → Generate
- **Tones:** Polite, Professional, Firm, Friendly

### 3. AI Email Drafter
- **Location:** Invoice Detail → "Send Email" button
- **Usage:** Opens modal with AI-generated email draft
- **Features:** Context-aware (new/overdue/reminder), editable

### 4. AI Search
- **Location:** Invoices page → Search bar
- **Usage:** Type natural language queries
- **Examples:**
  - "Show unpaid invoices for John"
  - "Find overdue invoices from last month"
  - "Show all invoices for ABC Corp"

## Cost Information

- **Model Used:** GPT-4o-mini (cost-effective)
- **Typical Cost:** ~$0.01-0.05 per request
- **Monthly Estimate:** $5-20 for moderate usage

### Cost Optimization Tips

1. Use GPT-4o-mini (already configured)
2. Consider rate limiting for production
3. Cache common queries
4. Monitor usage in OpenAI dashboard

## Troubleshooting

### "OpenAI API key not configured" Error

**Solution:**
1. Check `.env` file exists
2. Verify `VITE_OPENAI_API_KEY` is set
3. Restart dev server
4. Check for typos in the key

### "Failed to parse invoice description" Error

**Solution:**
1. Try rephrasing your description
2. Be more specific with quantities and prices
3. Include customer name clearly
4. Check OpenAI API status

### AI Features Not Working

**Check:**
1. API key is valid and active
2. You have credits in OpenAI account
3. No network/firewall issues
4. Browser console for errors

## Security Best Practices

1. ✅ Never commit `.env` file to git
2. ✅ Use environment variables in production
3. ✅ Rotate API keys regularly
4. ✅ Monitor API usage
5. ✅ Set usage limits in OpenAI dashboard

## Production Deployment

For production, set the environment variable in your hosting platform:

- **Vercel:** Project Settings → Environment Variables
- **Netlify:** Site Settings → Environment Variables
- **Railway:** Variables tab
- **Other:** Check your platform's documentation

## Alternative AI Providers

If you want to use a different AI provider, you can modify `src/services/aiService.ts` to use:
- Anthropic Claude
- Google Gemini
- Azure OpenAI
- Local models (Ollama, etc.)

## Support

For issues with AI features:
1. Check OpenAI status page
2. Verify API key is active
3. Check usage limits
4. Review error messages in console

Happy invoicing with AI! 🚀


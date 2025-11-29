# INVO Maker Setup Guide

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- (Optional) RevenueCat account for subscriptions

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to **Settings** > **API**
3. Copy your:
   - Project URL
   - `anon` public key

## Step 3: Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the migrations in order:
   - **First**: Open `supabase/migrations/001_initial_schema.sql`
     - Copy the entire SQL content
     - Paste it into the SQL Editor and click **Run**
   - **Second**: Open `supabase/migrations/002_fix_users_insert_policy.sql`
     - Copy the SQL content and run it
     - (Note: If you just ran 001, you can skip this as 001 now includes the fix)

This will create all the necessary tables, indexes, and Row Level Security policies.

## Step 4: Configure Environment Variables

1. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

2. Fill in your environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: RevenueCat
VITE_REVENUECAT_API_KEY=your_revenuecat_api_key

# Optional: OpenAI (for future AI features)
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Step 5: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Step 6: Create Your First Account

1. Navigate to the register page
2. Create an account
3. A default business will be automatically created
4. Start adding customers, products, and invoices!

## Project Structure

```
src/
├── components/      # Reusable UI components
│   ├── layout/     # Layout components (Header, Sidebar, etc.)
│   └── ui/         # Basic UI components (Button, LoadingSpinner, etc.)
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── lib/            # Third-party integrations (Supabase, RevenueCat)
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Database Schema

The app uses the following main tables:

- **users** - User profiles
- **businesses** - Business information (one per user)
- **customers** - Customer records
- **products** - Product catalog
- **invoices** - Invoice records
- **invoice_items** - Line items for invoices
- **payments** - Payment records
- **tax_rates** - Tax rate configurations

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Next Steps

1. **Customize Business Settings**: Go to Settings and update your business information
2. **Add Customers**: Start by adding your first customer
3. **Add Products**: Create your product catalog
4. **Create Invoices**: Generate your first invoice!

## Troubleshooting

### "Missing Supabase environment variables" error

Make sure your `.env` file exists and contains the correct Supabase credentials.

### Database errors

- Verify that you've run the migration SQL in Supabase
- Check that Row Level Security policies are enabled
- Ensure your Supabase project is active

### Build errors

- Make sure you're using Node.js 18+
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Support

For issues or questions, check the project README or open an issue in the repository.


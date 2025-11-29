# INVO Maker - AI Powered Invoice Management

A modern, responsive invoice management application built with React, Supabase, and AI capabilities.

## Features

- 📊 Dashboard with key metrics
- 👥 Customer management
- 📦 Product catalog
- 🧾 Invoice creation and management
- 💳 Payment tracking
- 🤖 AI-powered features:
  - AI Quick Invoice (create from description)
  - AI text helpers for notes/terms
  - AI email drafter
  - AI-powered search
- 📄 PDF generation
- 📷 Barcode scanning
- 📧 Email sending
- 📱 Fully responsive (mobile, tablet, desktop)
- 💰 RevenueCat subscription integration

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Subscriptions**: RevenueCat
- **Routing**: React Router v6

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your Supabase and RevenueCat credentials.

3. Run the development server:
```bash
npm run dev
```

## Database Setup

Run the SQL migrations in `supabase/migrations/` to set up your database schema.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and configurations
├── types/          # TypeScript type definitions
└── utils/          # Helper functions
```


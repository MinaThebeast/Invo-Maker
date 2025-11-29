# Troubleshooting Guide

## Common Issues and Solutions

### 401 Unauthorized Error from Supabase

**Error:** `Failed to load resource: the server responded with a status of 401 ()`

**Causes:**
1. **Missing Environment Variables**: Your `.env` file is missing or incomplete
2. **Incorrect Credentials**: Your Supabase URL or API key is wrong
3. **RLS Policies**: Row Level Security policies are blocking access

**Solutions:**

1. **Check your `.env` file:**
   ```bash
   # Make sure you have a .env file in the root directory
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Verify Supabase Setup:**
   - Go to your Supabase dashboard
   - Navigate to Settings > API
   - Copy the Project URL and anon public key
   - Make sure they match your `.env` file

3. **Run Database Migrations:**
   - In Supabase dashboard, go to SQL Editor
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_fix_users_insert_policy.sql` (if you already ran 001)
   - This creates all tables and RLS policies

4. **Restart Dev Server:**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

### React Router Warnings

**Warning:** `React Router Future Flag Warning`

These are just warnings about upcoming changes in React Router v7. They don't affect functionality. You can ignore them or add future flags to your router configuration if you want to opt-in early.

### Manifest.json Error

**Error:** `Manifest: Line: 1, column: 1, Syntax error`

This is usually from a browser extension or cached file. It doesn't affect the app. You can ignore it.

### page_all.js Messages

**Messages:** `init command html`, `init command clearCart`, etc.

These are from browser extensions (likely shopping or tracking extensions). They don't affect the app and can be ignored.

### Database Connection Issues

If you're getting connection errors:

1. **Check Supabase Project Status:**
   - Make sure your Supabase project is active (not paused)
   - Free tier projects pause after inactivity

2. **Verify Network:**
   - Check if you can access your Supabase dashboard
   - Try accessing the API directly: `https://your-project.supabase.co/rest/v1/`

3. **Check CORS Settings:**
   - In Supabase dashboard, go to Settings > API
   - Make sure your localhost is allowed (should be by default)

### Registration Not Working

If registration fails:

1. **Check RLS Policies:**
   - Make sure you've run both migration files
   - The users table needs INSERT policy (added in migration 002)

2. **Check Email Confirmation:**
   - Supabase may require email confirmation
   - Check your email for a confirmation link
   - Or disable email confirmation in Supabase Auth settings (for development)

3. **Check Console for Errors:**
   - Open browser DevTools (F12)
   - Look for specific error messages
   - Check the Network tab for failed requests

### Build Errors

**Error:** `Cannot find module` or similar

1. **Clear node_modules:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node Version:**
   ```bash
   node --version  # Should be 18+
   ```

3. **Clear Vite Cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

## Getting Help

If you're still having issues:

1. Check the browser console for specific error messages
2. Check the Network tab to see which requests are failing
3. Verify your Supabase project is set up correctly
4. Make sure all migration files have been run
5. Check that your `.env` file has the correct values

## Quick Health Check

Run through this checklist:

- [ ] `.env` file exists with correct Supabase credentials
- [ ] Supabase project is active
- [ ] Database migrations have been run
- [ ] Dev server is running (`npm run dev`)
- [ ] Browser console shows no critical errors
- [ ] Can access Supabase dashboard


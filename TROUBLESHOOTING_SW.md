# Service Worker Troubleshooting

If you're seeing service worker errors, follow these steps:

## Quick Fix

1. **Clear Browser Cache:**
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Clear storage" → "Clear site data"
   - Or manually:
     - Application → Service Workers → Unregister
     - Application → Storage → Clear site data

2. **Hard Refresh:**
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

3. **Incognito/Private Mode:**
   - Test in incognito/private window to avoid cached service workers

## Manual Unregister

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in the left sidebar
4. Click **Unregister** for any registered service workers
5. Refresh the page

## Code Solution

The code in `src/main.tsx` now automatically unregisters service workers on app load. This should prevent the issue going forward.

## If Issue Persists

1. Check browser extensions that might register service workers
2. Clear all browser data for localhost:5173
3. Restart the dev server: `npm run dev`


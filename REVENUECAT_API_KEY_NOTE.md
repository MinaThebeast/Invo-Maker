# ⚠️ RevenueCat API Key Format Notice

## Current API Key Format

I noticed your API key starts with `sk_` which is typically a **Stripe secret key** format.

RevenueCat API keys usually have one of these formats:
- **Public API Key**: Starts with `rcb_` (e.g., `rcb_abc123...`)
- **Web API Key**: Starts with `rcw_` (e.g., `rcw_abc123...`)

## How to Get Your RevenueCat API Key

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Select your project: "INVO Maker"
3. Navigate to **Project Settings** → **API Keys**
4. Copy your **Public API Key** (starts with `rcb_`)

## Update Your API Key

Once you have the correct RevenueCat API key:

1. **Update `.env` file:**
   ```env
   VITE_REVENUECAT_API_KEY=rcb_your_actual_key_here
   ```

2. **Run the setup script:**
   ```bash
   ./scripts/setup-revenuecat-keys.sh
   ```

3. **Or manually update:**
   - iOS: `ios/App/App/Info.plist` → `RevenueCatAPIKey`
   - Android: `android/app/src/main/res/values/strings.xml` → `revenuecat_api_key`

## Verification

After updating, the app should log:
- iOS: "✅ RevenueCat initialized successfully"
- Android: "RevenueCat initialized with API key"

If you see errors, double-check that you're using the **Public API Key** (not secret key) from RevenueCat.


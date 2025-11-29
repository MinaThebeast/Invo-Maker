# RevenueCat Plugin Xcode Setup Checklist

## ✅ What You've Done

1. ✅ Added `RevenueCatPlugin.swift` to the project
2. ✅ Code looks correct with all methods implemented

## 🔍 Verification Steps

### 1. Check File is Added to Target

In Xcode:
1. Select `RevenueCatPlugin.swift` in the project navigator
2. Open the **File Inspector** (right panel, first tab)
3. Under **Target Membership**, make sure **App** is checked ✅

### 2. Verify Build Settings

1. Select the **App** target in the project navigator
2. Go to **Build Phases** → **Compile Sources**
3. Make sure `RevenueCatPlugin.swift` is listed there

### 3. Check for Build Errors

Try building the project:
- **Product** → **Build** (⌘B)
- Check for any errors in the **Issue Navigator** (⌘5)

Common issues:
- **"No such module 'RevenueCat'"** → Run `pod install` in `ios/App` directory
- **"Cannot find type 'CAPPlugin'"** → Make sure Capacitor is properly linked

### 4. Verify Plugin Registration

Capacitor automatically discovers plugins that:
- Inherit from `CAPPlugin`
- Use `@objc` decorator
- Are in the app target

Your plugin should be automatically discovered. To verify:

1. Build and run the app
2. Check the console for any plugin-related errors
3. Test from JavaScript: `window.RevenueCat` should be available

## 🧪 Test the Plugin

Create a test in your React app:

```typescript
import RevenueCat from './lib/revenuecatNative';

// Test after user logs in
try {
  const result = await RevenueCat.identifyUser('test-user-id');
  console.log('✅ Plugin works!', result);
} catch (error) {
  console.error('❌ Plugin error:', error);
}
```

## 🔧 Troubleshooting

### If Plugin Not Found

1. **Clean Build Folder:**
   - **Product** → **Clean Build Folder** (⇧⌘K)
   - **Product** → **Build** (⌘B)

2. **Reinstall Pods:**
   ```bash
   cd ios/App
   pod install
   ```

3. **Sync Capacitor:**
   ```bash
   npm run build
   npm run cap:sync
   ```

### If Build Errors

**Error: "No such module 'RevenueCat'"**
```bash
cd ios/App
pod install
```

**Error: "Cannot find type 'CAPPlugin'"**
- Make sure Capacitor pods are installed
- Check that `RevenueCatPlugin.swift` is in the App target

**Error: "Duplicate symbol"**
- Make sure `RevenueCatPlugin.swift` is only added once
- Check for duplicate files in the project

## 📝 Next Steps

Once the plugin is working:

1. **Test identifyUser** - Call after user logs in
2. **Test getOfferings** - Get available subscription packages
3. **Test purchasePackage** - Make a test purchase (sandbox)
4. **Test getCustomerInfo** - Verify subscription status
5. **Test restorePurchases** - Test restore functionality

## ✅ Success Indicators

You'll know it's working when:
- ✅ App builds without errors
- ✅ No console errors about missing plugin
- ✅ JavaScript can call `RevenueCat.identifyUser()` successfully
- ✅ RevenueCat methods return data (not errors)


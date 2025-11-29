# RevenueCat Plugin - Quick Test Guide

## ✅ Setup Complete

Your RevenueCat plugin is now:
- ✅ Added to Xcode project
- ✅ Integrated into React app
- ✅ Will automatically identify user after login

## 🧪 Quick Test Steps

### 1. Build in Xcode

1. Open Xcode: `npm run cap:open ios`
2. Select a simulator or device
3. Build and run: **Product** → **Run** (⌘R)

### 2. Check Console Logs

After the app launches, you should see:
```
✅ RevenueCat initialized successfully
📱 RevenueCat SDK Version: [version number]
```

### 3. Test User Identification

1. Log in to the app
2. Check Xcode console for:
```
✅ RevenueCat user identified: [user-id]
   Active entitlements: [list of entitlements]
```

### 4. Test from JavaScript Console

In Safari Web Inspector (for iOS simulator):
1. **Safari** → **Develop** → **[Your Simulator]** → **[Your App]**
2. Open Console
3. Run:
```javascript
// Test plugin is available
window.RevenueCat

// Test identify user
RevenueCat.identifyUser({ userId: 'test-123' })
  .then(result => console.log('✅ Success:', result))
  .catch(error => console.error('❌ Error:', error))
```

## 🔍 Troubleshooting

### Plugin Not Found

**Error:** `Plugin "RevenueCat" does not exist`

**Solution:**
1. Make sure `RevenueCatPlugin.swift` is in the **App** target
2. Clean build: **Product** → **Clean Build Folder** (⇧⌘K)
3. Rebuild: **Product** → **Build** (⌘B)

### Build Errors

**Error:** `No such module 'RevenueCat'`
```bash
cd ios/App
pod install
```

**Error:** `Cannot find type 'CAPPlugin'`
- Make sure Capacitor pods are installed
- Check Podfile includes Capacitor

### Plugin Methods Not Working

1. Check Xcode console for errors
2. Verify API key is correct in `Info.plist`
3. Make sure user is logged in before calling `identifyUser`

## ✅ Success Checklist

- [ ] App builds without errors
- [ ] RevenueCat initializes on launch (see console)
- [ ] User is identified after login (see console)
- [ ] No plugin errors in console
- [ ] JavaScript can call RevenueCat methods

## 📝 Next: Test Purchase Flow

Once basic setup works:

1. **Configure Products in RevenueCat Dashboard**
   - Create products: `invo_maker_pro`, `invo_maker_gold`
   - Link to App Store Connect products
   - Create entitlements: `pro`, `gold`

2. **Test in Sandbox**
   - Use sandbox test account
   - Test purchase flow
   - Verify entitlements update

3. **Test Restore Purchases**
   - Test restore functionality
   - Verify previous purchases restore

## 🎉 You're Ready!

Once you see the success messages in the console, your RevenueCat integration is working! You can now:
- Identify users automatically after login
- Get available subscription packages
- Process purchases
- Check subscription status
- Restore purchases


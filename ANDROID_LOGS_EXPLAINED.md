# Android Log Messages Explained

## Fixed Issues ✅

### 1. OnBackInvokedCallback Warning
**Before:**
```
WindowOnBackDispatcher: OnBackInvokedCallback is not enabled for the application.
Set 'android:enableOnBackInvokedCallback="true"' in the application manifest.
```

**Fixed:** Added `android:enableOnBackInvokedCallback="true"` to AndroidManifest.xml

### 2. Undefined Console Messages
**Before:**
```
Capacitor/Console: File: - Line 333 - Msg: undefined
```

**Fixed:** Improved error handling in StatusBar initialization to prevent undefined error logging

## Harmless Warnings (Can Be Ignored) ⚠️

### 1. BLUETOOTH_CONNECT Permission
```
BLUETOOTH_CONNECT permission is missing.
getBluetoothAdapter() requires BLUETOOTH permission
```
**Explanation:** These are warnings from Chrome WebView trying to access Bluetooth features. Not needed for our app. Safe to ignore.

### 2. MESA/Rendernode Errors
```
Failed to open rendernode: No such file or directory
```
**Explanation:** These are emulator-specific graphics driver warnings. Only appear in Android emulator, not on real devices. Safe to ignore.

### 3. Access Denied Property Warnings
```
Access denied finding property "vendor.mesa.log"
```
**Explanation:** System property access warnings from the graphics stack. Harmless and can be ignored.

### 4. Skipped Frames Warning
```
Skipped 67 frames! The application may be doing too much work on its main thread.
```
**Explanation:** Common on first app launch when loading resources. Performance improves after initial load. Not critical.

### 5. Unable to Read Plugins File
```
Unable to read file at path public/plugins
```
**Explanation:** Capacitor warning about plugins manifest. This file is auto-generated and the warning is harmless.

### 6. Hidden API Warnings
```
hiddenapi: Accessing hidden method... using reflection: allowed
```
**Explanation:** Android system warnings about accessing internal APIs. These are from AndroidX libraries and are safe.

### 7. WebView Loading Messages
```
Loading com.google.android.webview version...
```
**Explanation:** Normal WebView initialization messages. Not errors.

## Summary

✅ **Fixed:** OnBackInvokedCallback and undefined console messages
⚠️ **Harmless:** All other warnings are system/emulator messages that don't affect app functionality

The app is working correctly! These warnings are normal for Android development and don't indicate any problems.


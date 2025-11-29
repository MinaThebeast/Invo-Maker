# Complete Android Studio Fix Guide

## The Problem

You're still seeing the error:
```
Activity class {com.invomaker.app/com.minaarian.invomaker.MainActivity} does not exist
```

This is **100% an Android Studio run configuration issue**, not a code issue. All your code files are correct.

## Quick Fix Script

Run this script to clean everything:

```bash
./fix-android-studio.sh
```

Then follow the steps below.

## Manual Fix Steps

### Step 1: Clean Everything

```bash
# Run the cleanup script
./fix-android-studio.sh

# OR manually:
cd android
./gradlew clean
cd ..
rm -rf .idea android/.idea android/.gradle android/app/build android/build
```

### Step 2: Close Android Studio

**Completely quit Android Studio** - don't just close the window. On Mac: `Cmd + Q`

### Step 3: Reopen and Reimport

1. Open Android Studio
2. **Don't** use "Open" - use **"Import Project"** or **"Open or Import"**
3. Select the **root directory** of your project (the one with `package.json`)
4. Wait for Android Studio to finish indexing (this may take a few minutes)

### Step 4: Fix Run Configuration (CRITICAL)

This is the most important step:

1. Go to `Run` → `Edit Configurations...`
2. **Delete the old configuration:**
   - Select the "app" configuration
   - Click the `-` (minus) button to delete it
3. **Create a new configuration:**
   - Click the `+` button
   - Select `Android App`
   - Fill in:
     - **Name:** `app`
     - **Module:** `app` (select from dropdown)
     - **Launch:** `Default Activity`
     - **Package:** `com.minaarian.invomaker` (should auto-fill, but verify it's correct)
   - Click `Apply` and `OK`

### Step 5: Sync Gradle

1. `File` → `Sync Project with Gradle Files`
2. Wait for sync to complete (check the bottom status bar)

### Step 6: Clean and Rebuild

1. `Build` → `Clean Project`
2. Wait for clean to complete
3. `Build` → `Rebuild Project`
4. Wait for rebuild to complete

### Step 7: Run the App

1. Select your device/emulator from the device dropdown
2. Click the Run button (green play icon)
3. The app should now launch successfully

## If It Still Doesn't Work

### Nuclear Option: Complete Reset

1. Close Android Studio
2. Run:
   ```bash
   rm -rf .idea
   rm -rf android/.idea
   rm -rf android/.gradle
   rm -rf android/app/build
   rm -rf android/build
   find android -name "*.iml" -delete
   ```
3. In Android Studio: `File` → `Invalidate Caches...` → Check all → `Invalidate and Restart`
4. After restart, reimport the project
5. Create a fresh run configuration

### Verify Your Configuration

All these should show `com.minaarian.invomaker`:

- ✅ `android/app/build.gradle` - namespace and applicationId
- ✅ `android/app/src/main/AndroidManifest.xml` - package and activity name
- ✅ `android/app/src/main/java/com/minaarian/invomaker/MainActivity.java` - package declaration
- ✅ `capacitor.config.ts` - appId
- ✅ Android Studio Run Configuration - Package field

## Common Mistakes

❌ **Don't:** Open the `android` folder directly in Android Studio
✅ **Do:** Open the root project folder (where `package.json` is)

❌ **Don't:** Keep the old run configuration
✅ **Do:** Delete and recreate it

❌ **Don't:** Skip the cache invalidation
✅ **Do:** Always invalidate caches after cleaning

## Still Having Issues?

The error message format `{com.invomaker.app/com.minaarian.invomaker.MainActivity}` tells us:
- Android Studio thinks the package is `com.invomaker.app` (wrong)
- But MainActivity is in `com.minaarian.invomaker` (correct)

This is **definitely** a run configuration issue. The code is correct.

Try building from command line to verify:
```bash
cd android
./gradlew assembleDebug
```

If this succeeds, the issue is 100% in Android Studio's run configuration.


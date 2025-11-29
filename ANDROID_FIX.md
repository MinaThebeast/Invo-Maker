# Fixing Android MainActivity Error

If you're seeing the error:
```
Activity class {com.invomaker.app/com.minaarian.invomaker.MainActivity} does not exist
```

This is caused by Android Studio caching the old package name `com.invomaker.app`. The error shows it's trying to use the old package but looking for MainActivity in the new package.

## Quick Fix (Run This First)

```bash
./clean-android.sh
```

Then follow the steps below in Android Studio.

## Complete Solution

### Step 1: Clean Everything (Already done if you ran the script)

The `clean-android.sh` script has already:
- Cleaned Gradle build
- Removed build directories
- Removed cache files

### Step 2: Fix Android Studio Run Configuration

**This is the most important step!**

1. In Android Studio, go to `Run` → `Edit Configurations...`
2. Select your app configuration (usually named "app")
3. Look for the **"Package"** or **"Launch"** field
4. If it shows `com.invomaker.app`, **change it to `com.minaarian.invomaker`**
5. Or delete the configuration and let Android Studio recreate it
6. Click `Apply` and `OK`

### Step 3: Invalidate Caches

1. `File` → `Invalidate Caches...`
2. Check **all** options:
   - ✅ Clear file system cache and Local History
   - ✅ Clear downloaded shared indexes
   - ✅ Clear VCS Log caches and indexes
3. Click `Invalidate and Restart`

### Step 4: Sync and Rebuild

1. After restart, `File` → `Sync Project with Gradle Files`
2. Wait for sync to complete
3. `Build` → `Clean Project`
4. `Build` → `Rebuild Project`

### Step 5: If Still Not Working

1. Close Android Studio completely
2. Delete these folders (if they exist):
   ```bash
   rm -rf .idea
   rm -rf android/.idea
   rm -rf android/.gradle
   rm -rf android/app/build
   ```
3. Reopen Android Studio
4. Open the project (point to the root directory)
5. Let it re-index everything
6. Sync Gradle again
7. Create a new run configuration if needed

### Step 6: Verify Package Name

All these files should have `com.minaarian.invomaker`:

- ✅ `android/app/build.gradle` - Line 4: `namespace "com.minaarian.invomaker"` and Line 7: `applicationId "com.minaarian.invomaker"`
- ✅ `android/app/src/main/AndroidManifest.xml` - Line 2: `package="com.minaarian.invomaker"` and Line 14: `android:name="com.minaarian.invomaker.MainActivity"`
- ✅ `android/app/src/main/java/com/minaarian/invomaker/MainActivity.java` - Line 1: `package com.minaarian.invomaker;`
- ✅ `capacitor.config.ts` - Line 4: `appId: 'com.minaarian.invomaker'`
- ✅ `android/app/src/main/res/values/strings.xml` - Lines 5-6

**All should use `com.minaarian.invomaker`, NOT `com.invomaker.app`.**

### Step 7: Create New Run Configuration (If Needed)

If the old configuration won't update:

1. `Run` → `Edit Configurations...`
2. Click the `-` button to delete the old configuration
3. Click the `+` button → `Android App`
4. Name it "app"
5. Module: select `app`
6. Launch: select `Default Activity`
7. Package: `com.minaarian.invomaker` (should auto-fill)
8. Click `Apply` and `OK`

### Still Having Issues?

Try building from command line to verify the package is correct:

```bash
cd android
./gradlew assembleDebug
```

If this succeeds, the issue is definitely in Android Studio's run configuration, not the code.


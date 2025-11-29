# Fixing Android MainActivity Error

If you're seeing the error:
```
Activity class {com.invomaker.app/com.minaarian.invomaker.MainActivity} does not exist
```

This is usually caused by Android Studio caching the old package name. Follow these steps:

## Solution

1. **Clean the Android Build:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Invalidate Android Studio Caches:**
   - In Android Studio: `File` → `Invalidate Caches...`
   - Check all options
   - Click `Invalidate and Restart`

3. **Sync Gradle:**
   - In Android Studio: `File` → `Sync Project with Gradle Files`

4. **Check Run Configuration:**
   - Go to `Run` → `Edit Configurations...`
   - Select your app configuration
   - Verify the package name is `com.minaarian.invomaker`
   - If it shows `com.invomaker.app`, change it to `com.minaarian.invomaker`

5. **Rebuild the Project:**
   - `Build` → `Clean Project`
   - `Build` → `Rebuild Project`

6. **If Still Not Working:**
   - Close Android Studio
   - Delete `.idea` folder in the project root (if it exists)
   - Delete `android/.gradle` folder
   - Reopen Android Studio
   - Let it re-index the project

## Verify Package Name

Make sure these files have the correct package name `com.minaarian.invomaker`:

- ✅ `android/app/build.gradle` - `namespace` and `applicationId`
- ✅ `android/app/src/main/AndroidManifest.xml` - Activity name
- ✅ `android/app/src/main/java/com/minaarian/invomaker/MainActivity.java` - Package declaration
- ✅ `capacitor.config.ts` - `appId`

All should use `com.minaarian.invomaker`, NOT `com.invomaker.app`.


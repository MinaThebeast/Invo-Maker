# Java Setup for Android Development

## Current Issue

Gradle is configured to use Java 21, but your system has Java 17. Android Studio is trying to use JetBrains Runtime 21 (bundled with Android Studio), but Gradle can't find it.

**Note:** Capacitor's auto-generated `capacitor.build.gradle` requires Java 21, so we need to use Java 21.

## Solution Options

### Option 1: Use Android Studio's Bundled JDK (Recommended - Easiest)

Android Studio comes with JetBrains Runtime 21. Configure Gradle to use it:

1. In Android Studio: `File` → `Settings` (or `Preferences` on Mac)
2. Go to `Build, Execution, Deployment` → `Build Tools` → `Gradle`
3. Under **"Gradle JDK"**, select:
   - `JetBrains Runtime 21.0.8` or
   - `jbr-21` or
   - Any option that shows Java 21
4. Click `Apply` and `OK`
5. Sync Gradle: `File` → `Sync Project with Gradle Files`

This should resolve the "Undefined java.home" error.

### Option 2: Install Java 21 System-Wide

If you need Java 21 for other projects:

1. **Install Java 21 using Homebrew:**
   ```bash
   brew install openjdk@21
   ```

2. **Link it:**
   ```bash
   sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
   ```

3. **Verify installation:**
   ```bash
   /usr/libexec/java_home -V
   ```

4. **Update `android/gradle.properties`:**
   ```properties
   org.gradle.java.home=/Library/Java/JavaVirtualMachines/openjdk-21.jdk/Contents/Home
   ```

### Option 3: Configure Android Studio to Use JetBrains Runtime

If Android Studio has JetBrains Runtime 21 bundled:

1. In Android Studio: `File` → `Settings` (or `Preferences` on Mac)
2. Go to `Build, Execution, Deployment` → `Build Tools` → `Gradle`
3. Under "Gradle JDK", select the JetBrains Runtime 21 option
4. Click `Apply` and `OK`
5. Sync Gradle: `File` → `Sync Project with Gradle Files`

## Verify Java Configuration

After making changes, verify:

```bash
# Check available Java versions
/usr/libexec/java_home -V

# Check current Java version
java -version

# Test Gradle build
cd android
./gradlew --version
```

## Current Status

⚠️ **Capacitor requires Java 21** - The `capacitor.build.gradle` file is auto-generated and requires Java 21.

✅ Your system has Java 17 installed, but we need Java 21
✅ Android Studio has JetBrains Runtime 21 bundled

**Next Steps:**
1. Configure Android Studio to use its bundled JDK (Option 1 above)
2. Or install Java 21 system-wide (Option 2 above)

After configuring, the build should work correctly.


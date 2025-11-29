#!/bin/bash

echo "🔧 Fixing Android Studio Configuration Issues..."
echo ""

# Step 1: Clean Android build
echo "1️⃣ Cleaning Android build..."
cd android
./gradlew clean > /dev/null 2>&1
cd ..

# Step 2: Remove Android Studio cache files
echo "2️⃣ Removing Android Studio cache files..."
rm -rf .idea
rm -rf android/.idea
rm -rf android/.gradle
rm -rf android/app/build
rm -rf android/build
rm -rf android/app/.cxx

# Step 3: Remove any .iml files
echo "3️⃣ Removing .iml files..."
find android -name "*.iml" -delete 2>/dev/null

# Step 4: Sync Capacitor
echo "4️⃣ Syncing Capacitor..."
npm run build > /dev/null 2>&1
npx cap sync android > /dev/null 2>&1

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Next steps in Android Studio:"
echo ""
echo "1. Close Android Studio completely"
echo "2. Reopen Android Studio"
echo "3. Open the project (select the root directory)"
echo "4. Wait for indexing to complete"
echo "5. File → Sync Project with Gradle Files"
echo "6. Run → Edit Configurations..."
echo "   - Delete the old 'app' configuration if it exists"
echo "   - Click '+' → 'Android App'"
echo "   - Name: 'app'"
echo "   - Module: 'app'"
echo "   - Launch: 'Default Activity'"
echo "   - Package: 'com.minaarian.invomaker' (should auto-fill)"
echo "   - Click 'Apply' and 'OK'"
echo "7. Build → Clean Project"
echo "8. Build → Rebuild Project"
echo "9. Run the app"
echo ""


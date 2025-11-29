#!/bin/bash

# Clean Android build completely
echo "🧹 Cleaning Android build..."

cd android

# Clean Gradle
echo "Cleaning Gradle..."
./gradlew clean

# Remove build directories
echo "Removing build directories..."
rm -rf app/build
rm -rf build
rm -rf .gradle
rm -rf app/.cxx

# Remove generated files
echo "Removing generated files..."
find . -name "*.iml" -delete
find . -name ".DS_Store" -delete

cd ..

# Clean Capacitor
echo "Cleaning Capacitor..."
rm -rf node_modules/.cache

echo "✅ Clean complete!"
echo ""
echo "Next steps:"
echo "1. In Android Studio: File → Invalidate Caches → Invalidate and Restart"
echo "2. File → Sync Project with Gradle Files"
echo "3. Build → Clean Project"
echo "4. Build → Rebuild Project"


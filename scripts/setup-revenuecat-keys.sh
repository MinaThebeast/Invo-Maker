#!/bin/bash

# Script to set RevenueCat API key in native projects from .env file

echo "🔑 Setting up RevenueCat API keys for native projects..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with VITE_REVENUECAT_API_KEY=your_key_here"
    exit 1
fi

# Read API key from .env
REVENUECAT_API_KEY=$(grep "VITE_REVENUECAT_API_KEY" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)

if [ -z "$REVENUECAT_API_KEY" ]; then
    echo "❌ Error: VITE_REVENUECAT_API_KEY not found in .env file!"
    exit 1
fi

echo "✅ Found RevenueCat API key"

# Update Android strings.xml
ANDROID_STRINGS="android/app/src/main/res/values/strings.xml"
if [ -f "$ANDROID_STRINGS" ]; then
    # Use sed to replace the placeholder (works on macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/YOUR_REVENUECAT_API_KEY_HERE/$REVENUECAT_API_KEY/g" "$ANDROID_STRINGS"
    else
        sed -i "s/YOUR_REVENUECAT_API_KEY_HERE/$REVENUECAT_API_KEY/g" "$ANDROID_STRINGS"
    fi
    echo "✅ Updated Android strings.xml"
else
    echo "⚠️  Warning: Android strings.xml not found at $ANDROID_STRINGS"
fi

# Update iOS Info.plist
IOS_INFO_PLIST="ios/App/App/Info.plist"
if [ -f "$IOS_INFO_PLIST" ]; then
    # Use sed to replace the placeholder (works on macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/YOUR_REVENUECAT_API_KEY_HERE/$REVENUECAT_API_KEY/g" "$IOS_INFO_PLIST"
    else
        sed -i "s/YOUR_REVENUECAT_API_KEY_HERE/$REVENUECAT_API_KEY/g" "$IOS_INFO_PLIST"
    fi
    echo "✅ Updated iOS Info.plist"
else
    echo "⚠️  Warning: iOS Info.plist not found at $IOS_INFO_PLIST"
fi

echo ""
echo "✅ RevenueCat API keys have been set in native projects!"
echo ""
echo "Next steps:"
echo "1. Run: npm run cap:sync"
echo "2. For iOS: cd ios/App && pod install"
echo "3. Build and run your native apps"


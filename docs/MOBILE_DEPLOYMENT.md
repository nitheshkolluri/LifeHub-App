# LifeHub Mobile App Deployment Guide

This guide covers deploying LifeHub as native iOS and Android applications using Capacitor.

## Table of Contents

1. [Capacitor Setup](#capacitor-setup)
2. [iOS App Store Deployment](#ios-app-store-deployment)
3. [Android Google Play Deployment](#android-google-play-deployment)
4. [In-App Purchases Setup](#in-app-purchases-setup)
5. [Push Notifications](#push-notifications)
6. [App Store Optimization](#app-store-optimization)

---

## Capacitor Setup

Capacitor converts your React web app into native iOS and Android apps.

### 1. Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

### 2. Initialize Capacitor

```bash
npx cap init
```

When prompted:
- **App name**: LifeHub
- **App ID**: `com.lifehub.app` (use your own domain)
- **Web directory**: `dist`

### 3. Create Capacitor Config

Create `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifehub.app',
  appName: 'LifeHub',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    hostname: 'app.lifehub.com',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6366f1',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
```

### 4. Add Mobile Platforms

```bash
# Build web app first
npm run build

# Add platforms
npx cap add ios
npx cap add android
```

### 5. Install Mobile-Specific Plugins

```bash
npm install @capacitor/splash-screen
npm install @capacitor/push-notifications
npm install @capacitor/app
npm install @capacitor/haptics
npm install @capacitor/status-bar
npm install @capacitor/keyboard
```

### 6. Sync Web Code to Native Projects

```bash
npx cap sync
```

Run this command every time you update your web code.

---

## iOS App Store Deployment

### Prerequisites

- **Mac computer** (required for iOS development)
- **Xcode** (latest version from Mac App Store)
- **Apple Developer Account** ($99/year)

### 1. Apple Developer Account Setup

1. Go to [developer.apple.com](https://developer.apple.com)
2. Enroll in Apple Developer Program ($99/year)
3. Complete enrollment (may take 24-48 hours)

### 2. App Store Connect Setup

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in app information:
   - **Platform**: iOS
   - **Name**: LifeHub
   - **Primary Language**: English
   - **Bundle ID**: com.lifehub.app (must match Capacitor config)
   - **SKU**: lifehub-ios-001
   - **User Access**: Full Access

### 3. Prepare App Icons and Screenshots

#### App Icon

Create app icons in these sizes (use a tool like [appicon.co](https://appicon.co)):
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)
- 87x87 (iPhone)
- 80x80 (iPad)
- 76x76 (iPad)
- 60x60 (iPhone)
- 58x58 (iPhone)
- 40x40 (iPad/iPhone)
- 29x29 (iPad/iPhone)
- 20x20 (iPad/iPhone)

#### Screenshots

Required sizes:
- **6.7" Display** (iPhone 14 Pro Max): 1290 x 2796
- **6.5" Display** (iPhone 11 Pro Max): 1242 x 2688
- **5.5" Display** (iPhone 8 Plus): 1242 x 2208
- **12.9" iPad Pro**: 2048 x 2732

Minimum 3 screenshots per size. Use tools like:
- [Figma](https://figma.com) with device frames
- [Previewed](https://previewed.app)
- [Screenshot Creator](https://www.appstorescreenshot.com)

### 4. Configure Xcode Project

```bash
# Open iOS project in Xcode
npx cap open ios
```

In Xcode:

1. **Select your project** in the navigator
2. **General tab**:
   - Display Name: LifeHub
   - Bundle Identifier: com.lifehub.app
   - Version: 1.0.0
   - Build: 1
   - Deployment Target: iOS 14.0 or later

3. **Signing & Capabilities**:
   - Team: Select your Apple Developer team
   - Signing Certificate: Automatic
   - Enable capabilities:
     - Push Notifications
     - Background Modes (Remote notifications)
     - In-App Purchase

4. **Info.plist** (add required permissions):
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>LifeHub needs camera access for profile photos</string>
   <key>NSMicrophoneUsageDescription</key>
   <string>LifeHub needs microphone access for voice input</string>
   <key>NSPhotoLibraryUsageDescription</key>
   <string>LifeHub needs photo library access to save images</string>
   ```

### 5. Create App Icons in Xcode

1. In Xcode, go to Assets.xcassets
2. Click on AppIcon
3. Drag and drop icon files into appropriate slots
4. Or use [appicon.co](https://appicon.co) to generate all sizes

### 6. Build and Archive

1. In Xcode, select **Any iOS Device** as build target
2. Go to **Product** → **Archive**
3. Wait for build to complete (5-10 minutes)
4. When done, Xcode Organizer will open

### 7. Upload to App Store Connect

1. In Xcode Organizer, select your archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Click **Upload**
5. Wait for upload to complete (5-15 minutes)

### 8. Complete App Store Listing

In App Store Connect:

1. **App Information**:
   - Subtitle: "Your AI-Powered Life Assistant"
   - Category: Productivity
   - Secondary Category: Lifestyle

2. **Pricing and Availability**:
   - Price: Free
   - Availability: All countries

3. **App Privacy**:
   - Data collection: Yes
   - Data types: Email, Name, Usage Data
   - Purpose: App functionality, Analytics
   - Linked to user: Yes

4. **Version Information**:
   - Screenshots: Upload prepared screenshots
   - Promotional Text: "Organize your life with AI"
   - Description: (see template below)
   - Keywords: productivity, ai, tasks, habits, finance
   - Support URL: https://lifehub.app/support
   - Marketing URL: https://lifehub.app

5. **Build**: Select the uploaded build

6. **App Review Information**:
   - Contact: Your email
   - Phone: Your phone
   - Demo account: Create test account with sample data
   - Notes: "Premium features require subscription"

### 9. Submit for Review

1. Click **Add for Review**
2. Click **Submit to App Store**
3. Wait for review (typically 24-48 hours)

### 10. TestFlight (Beta Testing)

Before submitting to App Store, test with TestFlight:

1. In App Store Connect, go to TestFlight
2. Add internal testers (up to 100)
3. Share TestFlight link
4. Collect feedback
5. Fix issues
6. Upload new build if needed

---

## Android Google Play Deployment

### Prerequisites

- **Android Studio** (download from [developer.android.com](https://developer.android.com/studio))
- **Google Play Developer Account** ($25 one-time fee)

### 1. Google Play Console Setup

1. Go to [play.google.com/console](https://play.google.com/console)
2. Pay $25 registration fee
3. Complete account verification
4. Create new app:
   - **App name**: LifeHub
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free

### 2. Prepare Assets

#### App Icon

- **512 x 512** PNG (for Play Store)
- **192 x 192** PNG (launcher icon)
- **96 x 96** PNG (launcher icon)

#### Feature Graphic

- **1024 x 500** PNG or JPG

#### Screenshots

Required:
- **Phone**: 1080 x 1920 (minimum 2 screenshots)
- **7" Tablet**: 1200 x 1920 (optional)
- **10" Tablet**: 1600 x 2560 (optional)

### 3. Configure Android Project

```bash
# Open Android project in Android Studio
npx cap open android
```

In Android Studio:

1. **Update `android/app/build.gradle`**:

```gradle
android {
    namespace "com.lifehub.app"
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.lifehub.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

2. **Update `AndroidManifest.xml`**:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    
    <application
        android:label="LifeHub"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">
        <!-- ... -->
    </application>
</manifest>
```

### 4. Generate Signing Key

```bash
# Navigate to android/app
cd android/app

# Generate keystore
keytool -genkey -v -keystore lifehub-release-key.keystore -alias lifehub -keyalg RSA -keysize 2048 -validity 10000

# Answer prompts (remember the passwords!)
```

**IMPORTANT**: Store this keystore file securely! You cannot update your app without it.

### 5. Configure Signing

Create `android/key.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=lifehub
storeFile=lifehub-release-key.keystore
```

Update `android/app/build.gradle`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ...
        }
    }
}
```

### 6. Build Release APK/AAB

```bash
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### 7. Upload to Google Play Console

1. In Play Console, go to your app
2. Go to **Production** → **Create new release**
3. Upload `app-release.aab`
4. Add release notes:
   ```
   Initial release of LifeHub
   - AI-powered task management
   - Habit tracking
   - Finance management
   - Premium subscription features
   ```
5. Click **Save** → **Review release**

### 8. Complete Store Listing

1. **Main store listing**:
   - Short description: "AI-powered life management"
   - Full description: (see template below)
   - App icon: Upload 512x512 PNG
   - Feature graphic: Upload 1024x500 PNG
   - Screenshots: Upload phone screenshots

2. **Categorization**:
   - App category: Productivity
   - Tags: productivity, ai, tasks

3. **Contact details**:
   - Email: support@lifehub.app
   - Website: https://lifehub.app
   - Privacy policy: https://lifehub.app/privacy

4. **Content rating**:
   - Complete questionnaire
   - Typically rated: Everyone

5. **App content**:
   - Privacy policy: Required
   - Ads: No (unless you have ads)
   - In-app purchases: Yes
   - Target audience: 18+

### 9. Submit for Review

1. Go to **Publishing overview**
2. Review all sections (must be complete)
3. Click **Send for review**
4. Wait for review (typically 1-7 days)

### 10. Internal Testing Track

Before production release, use internal testing:

1. Go to **Internal testing**
2. Create release
3. Add testers (email addresses)
4. Share testing link
5. Collect feedback
6. Promote to production when ready

---

## In-App Purchases Setup

### iOS In-App Purchases

1. **App Store Connect**:
   - Go to your app → Features → In-App Purchases
   - Click "+" to create new subscription
   - Type: Auto-Renewable Subscription
   - Reference Name: LifeHub Pro Monthly
   - Product ID: com.lifehub.app.pro.monthly
   - Subscription Group: LifeHub Pro
   - Price: $9.99/month
   - Add localized description

2. **Repeat for yearly subscription**:
   - Product ID: com.lifehub.app.pro.yearly
   - Price: $99.99/year

3. **Submit for review** with app

### Android In-App Purchases

1. **Google Play Console**:
   - Go to Monetize → Products → Subscriptions
   - Create subscription
   - Product ID: pro_monthly
   - Name: LifeHub Pro Monthly
   - Description: "Unlock premium features"
   - Price: $9.99/month
   - Billing period: 1 month
   - Free trial: 7 days (optional)

2. **Repeat for yearly subscription**:
   - Product ID: pro_yearly
   - Price: $99.99/year

3. **Activate subscriptions**

### Recommended: Use RevenueCat

[RevenueCat](https://www.revenuecat.com) simplifies cross-platform subscriptions:

```bash
npm install @revenuecat/purchases-capacitor
```

See [RevenueCat Capacitor docs](https://docs.revenuecat.com/docs/capacitor) for integration.

---

## Push Notifications

### Firebase Cloud Messaging (FCM)

1. **Firebase Console**:
   - Go to Project Settings → Cloud Messaging
   - Generate new key pair
   - Download `google-services.json` (Android)
   - Download `GoogleService-Info.plist` (iOS)

2. **Add to projects**:
   - Android: Place `google-services.json` in `android/app/`
   - iOS: Place `GoogleService-Info.plist` in `ios/App/App/`

3. **Configure Capacitor**:

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Request permission
await PushNotifications.requestPermissions();

// Register for push
await PushNotifications.register();

// Listen for token
PushNotifications.addListener('registration', (token) => {
  console.log('Push token:', token.value);
  // Send to your backend
});
```

### Apple Push Notification Service (APNs)

1. **Apple Developer**:
   - Go to Certificates, Identifiers & Profiles
   - Keys → "+" → Apple Push Notifications service (APNs)
   - Download `.p8` key file
   - Note Key ID and Team ID

2. **Upload to Firebase**:
   - Firebase Console → Project Settings → Cloud Messaging
   - iOS app configuration
   - Upload APNs key
   - Enter Key ID and Team ID

---

## App Store Optimization (ASO)

### App Description Template

```
Transform your life with LifeHub - the AI-powered assistant that helps you manage tasks, build habits, and track finances all in one place.

🎯 SMART TASK MANAGEMENT
• AI-powered task creation from voice or text
• Intelligent priority detection
• Due date reminders
• Tag and organize effortlessly

🔥 HABIT TRACKING
• Build lasting habits with streak tracking
• Daily and weekly goals
• Visual progress charts
• Motivational insights

💰 FINANCE MANAGEMENT
• Track bills and subscriptions
• Split payment reminders
• Monthly spending overview
• Privacy-first (no bank connection required)

🤖 AI ASSISTANT
• Natural language processing
• Context-aware suggestions
• Weekly executive reports (Premium)
• Reduce cognitive load

✨ PREMIUM FEATURES
• Unlimited AI interactions
• Advanced analytics
• Priority support
• Weekly AI-generated reports

PRIVACY FIRST
• Your data stays yours
• No selling to third parties
• Bank-free finance tracking
• Secure Firebase backend

Download LifeHub today and experience the future of personal productivity!

---
Subscription required for premium features. Terms: https://lifehub.app/terms
Privacy: https://lifehub.app/privacy
```

### Keywords

**iOS**: productivity, ai, tasks, habits, finance, assistant, planner, organizer, goals, tracker

**Android**: Use same keywords in description naturally

### Tips for Approval

1. **Provide demo account** with sample data
2. **Explain premium features** clearly
3. **Include privacy policy** link
4. **Test thoroughly** before submission
5. **Respond quickly** to reviewer questions
6. **Follow guidelines**:
   - [iOS App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
   - [Google Play Policy](https://play.google.com/about/developer-content-policy/)

---

## Post-Launch Checklist

- [ ] Monitor crash reports (Firebase Crashlytics)
- [ ] Respond to user reviews
- [ ] Track analytics (Firebase Analytics)
- [ ] Monitor subscription metrics
- [ ] Plan updates and new features
- [ ] A/B test app store listing
- [ ] Collect user feedback

---

## Common Rejection Reasons

### iOS

1. **Missing demo account** - Always provide test credentials
2. **Incomplete functionality** - All features must work
3. **Privacy policy missing** - Required for data collection
4. **Subscription unclear** - Clearly explain what's included

### Android

1. **Misleading description** - Be accurate
2. **Copyright issues** - Use only your own assets
3. **Broken functionality** - Test thoroughly
4. **Privacy policy required** - Must be accessible

---

## Updating Your App

### iOS

1. Increment version in Xcode (e.g., 1.0.0 → 1.1.0)
2. Increment build number (e.g., 1 → 2)
3. Archive and upload
4. Create new version in App Store Connect
5. Submit for review

### Android

1. Increment `versionCode` in `build.gradle` (e.g., 1 → 2)
2. Update `versionName` (e.g., "1.0.0" → "1.1.0")
3. Build new AAB
4. Upload to new release in Play Console
5. Submit for review

---

**Next Steps**: After app store approval, focus on user acquisition and retention strategies.

**Support**: For app store issues, consult official documentation or developer forums.

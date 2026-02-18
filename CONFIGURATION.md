# VendStats Configuration Guide

## RevenueCat Setup

### 1. Create RevenueCat Account
1. Sign up at [RevenueCat Dashboard](https://app.revenuecat.com)
2. Create a new app/project
3. Add your iOS app with Bundle ID: `com.vendstats.app`

### 2. Get API Keys
1. Go to Projects & Apps → Your App → API Keys
2. Copy the **Apple App Store** API key (starts with `appl_`)
3. Store this key securely

### 3. Configure Environment Variables
1. Open your `.env` file
2. Replace the placeholder:
   ```
   EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=your_actual_api_key_here
   ```
3. Save the file

### 4. Create Products in RevenueCat
1. Go to Products → Add Product
2. Create these products:
   - **Monthly Plan**: `monthly` ($4.99/month)
   - **Yearly Plan**: `yearly` ($29.99/year)

### 5. Create Entitlement
1. Go to Entitlements → Add Entitlement
2. Name it `pro`
3. Attach both products to this entitlement

### 6. Test Configuration
Run the app and check the logs for:
```
RevenueCat initialized successfully: true
```

## App Store Connect Setup

### Required for App Store Submission:
- ✅ App built with EAS Build
- ✅ Screenshots (6.7", 6.5", 5.5" displays)
- ✅ App description and keywords
- ✅ Privacy Policy URL
- ✅ License Agreement: Apple’s Standard License Agreement
- ⏳ RevenueCat API Key configured

### App Store Connect Metadata (Required)
- Privacy Policy field: add your public privacy policy URL
- EULA field: choose Apple&apos;s Standard License Agreement
- App Description: include Terms of Use (EULA) reference if needed

### Privacy Requirements:
The app includes an in-app privacy policy that covers:
- User data collection (anonymous analytics)
- Subscription data handling
- No personal information stored locally

### Build Commands:
```bash
# Install dependencies
npm install

# Run development
npx expo start

# Build for App Store
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

## Troubleshooting

### RevenueCat Issues:
- Check API key format (should start with `appl_`)
- Verify `.env` file exists and is not in git
- Check products are created in RevenueCat dashboard
- Ensure entitlement `pro` exists and is attached to products

### Environment Issues:
- Restart Metro bundler after changing `.env`
- Clear Expo cache: `npx expo start --clear`
- Check environment variables: `console.log(process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY)`

### Build Issues:
- Update EAS CLI: `npm install -g @expo/eas-cli`
- Login to EAS: `eas login`
- Configure build profiles: `eas build:configure`

## Configuration Status Check

Debug the current configuration:
```typescript
import { getConfigStatus } from './src/config/revenuecat';
console.log(getConfigStatus());
```

Expected output when configured:
```json
{
  "hasAppleKey": true,
  "hasGoogleKey": false,
  "isConfigured": true,
  "entitlementID": "pro"
}
```
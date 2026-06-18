# VendStats

A mobile app for pop-up vendors to track event revenue, expenses, and profit.

## Tech Stack

- React Native (Expo)
- TypeScript
- NativeWind for Tailwind styling
- MMKV for local persistent storage
- React Navigation (stack + tabs)
- RevenueCat for subscription management
- Firebase Analytics for Google Ads app campaign attribution

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/
│       ├── Card.tsx
│       ├── StatBox.tsx
│       ├── PrimaryButton.tsx
│       ├── InputField.tsx
│       └── ...
├── constants/           # App constants
│   ├── colors.ts
│   └── layout.ts
├── features/            # Feature-based modules
│   ├── events/
│   │   └── screens/
│   ├── sales/
│   │   └── screens/
│   ├── stats/
│   │   └── screens/
│   ├── settings/
│   │   └── screens/
│   └── subscription/
│       └── screens/
├── hooks/               # Custom React hooks
│   ├── useEvents.ts
│   ├── useSales.ts
│   ├── useStats.ts
│   └── useSubscription.ts
├── navigation/          # Navigation configuration
│   ├── RootNavigator.tsx
│   ├── TabNavigator.tsx
│   └── types.ts
├── storage/             # MMKV storage helpers
│   ├── mmkv.ts
│   ├── events.ts
│   ├── sales.ts
│   └── subscription.ts
├── types/               # TypeScript types
│   └── index.ts
└── utils/               # Utility functions
    ├── currency.ts
    └── calculations.ts
```

## Features

### Events
- Create events with name, date, booth fee, travel cost, and notes
- View event dashboard with profit/revenue statistics
- Edit and delete events

### Sales
- Log sales with item name, quantity, price, and cost
- Quick sale feature for fast data entry
- Edit and delete individual sales

### Statistics
- Per-event dashboard showing:
  - Total revenue
  - Total expenses
  - Net profit
  - Profit margin %
  - Best selling item
- Global stats showing:
  - Total revenue across all events
  - Total profit
  - Most profitable event
  - Average profit per event

### Subscription (RevenueCat)
- 7-day free trial
- Premium features:
  - Unlimited events
  - Advanced statistics
  - CSV export

## Configuration

### RevenueCat Setup

1. Create an account at [RevenueCat](https://www.revenuecat.com/)
2. Create a new project and configure your products
3. Update `app.json` with your API key
4. Update `App.tsx` with your public SDK key

### Firebase Analytics Setup

1. Android is already wired to `google-services.json` for Firebase.
2. Download `GoogleService-Info.plist` for the iOS app with bundle ID `com.vendstats.app` from Firebase Console.
3. Place the file at the project root and add `"googleServicesFile": "./GoogleService-Info.plist"` under the iOS section of `app.json`.
4. Rebuild the native app after config changes with `npx expo prebuild --clean` and then `npx expo run:ios` or `npx expo run:android`.
5. Link the Firebase project to Google Ads and import Firebase conversions in Google Ads.

## License

MIT

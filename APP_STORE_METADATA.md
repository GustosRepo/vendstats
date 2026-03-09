# VendStats – App Store Submission Checklist & Metadata

## App Store Connect Metadata

### App Name
**VendStats** — Vendor Sales Tracker

### Subtitle (30 chars max)
Track Sales, Costs & Profits

### Promotional Text (170 chars, can update without new build)
Track every sale, event, and expense in one place. See your real profits — not just revenue — and make smarter decisions for your next vendor event.

### Description
VendStats is the all-in-one sales tracker built for market vendors, pop-up sellers, craft fair makers, and food truck owners.

**Track Everything That Matters**
• Log sales with tap-to-sell quick buttons or manual entry
• Track booth fees, travel costs, supplies, and miscellaneous expenses
• Add product photos and ingredient cost breakdowns
• Monitor stock levels with low-stock alerts

**See Your Real Profits**
• Automatic profit & loss per event
• Gross profit, net profit, and profit margin calculations
• Break-even analysis so you know how many units until you're profitable

**Smart Insights**
• Best & worst selling products across all your events
• Day-of-week profitability analysis
• Margin trends over time
• Location-based performance comparison
• Prep recommendations based on sales history
• Sales forecasting weighted by weather, tags, and location

**Plan Smarter**
• Compare events side-by-side
• Export reports as CSV
• QR code display for customer payments

**Built for Vendors**
• Works offline — all data stored on your device
• Supports English, Thai, and Spanish
• Currency support: USD, THB, MXN, EUR
• Beautiful, fast interface designed for use between customers

VendStats Premium unlocks unlimited events, advanced statistics, CSV export, and more.

### Keywords (100 chars max)
vendor,sales,tracker,market,profit,booth,craft,fair,food,truck,pop-up,inventory,expense,event,stats

### Category
Primary: Business
Secondary: Finance

### Age Rating
4+ (No objectionable content)

---

## Pre-Submission Checklist

### Build & Configuration
- [x] `app.json` — version, bundleIdentifier, buildNumber set
- [x] `eas.json` — production profile with autoIncrement
- [x] `ITSAppUsesNonExemptEncryption` — set to `false`
- [x] Bundle ID: `com.vendstats.app`
- [x] Orientation: portrait
- [x] Supports iPad (supportsTablet: true)

### Privacy & Legal
- [x] Privacy Policy screen in-app
- [x] Terms of Service / EULA screen in-app
- [x] Privacy Policy URL: `https://www.code-werx.com/vendstats/privacy`
- [x] NSCameraUsageDescription — photo capture for products & receipts
- [x] NSPhotoLibraryUsageDescription — import product/receipt photos
- [ ] Publish Privacy Policy & TOS pages at the above URL before submission
- [ ] Fill out App Store Connect privacy questionnaire (data NOT collected — all local storage)

### In-App Purchases
- [x] RevenueCat integration (react-native-purchases)
- [ ] Create subscription product in App Store Connect
- [ ] Configure subscription in RevenueCat dashboard
- [ ] Subscription disclosure text in PaywallScreen ✓

### Assets
- [x] App icon: `assets/icon.png` (1024×1024)
- [x] Splash screen configured with branded background (#E8F1F8)
- [ ] Screenshots: 6.7" (iPhone 15 Pro Max) — 3-5 required
- [ ] Screenshots: 6.5" (iPhone 14 Plus) — optional but recommended
- [ ] Screenshots: 5.5" (iPhone 8 Plus) — optional
- [ ] Screenshots: 12.9" iPad Pro — 3-5 required (supports tablet)

### Code Quality
- [x] TypeScript strict — `npx tsc --noEmit` passes clean
- [x] Unit tests — 31 tests passing (calculations.test.ts)
- [x] Performance optimized — React.memo, data-version skip-reload, useMemo/useCallback
- [x] Accessibility — roles and labels on all interactive components
- [x] i18n — EN/TH/ES complete
- [x] Theme tokens — no hardcoded neutral colors

### Final Build Steps
```bash
# 1. Bump version if needed
# In app.json: "version": "1.0.0"

# 2. Build for App Store
eas build --platform ios --profile production

# 3. Submit to App Store
eas submit --platform ios
```

### App Review Notes
> VendStats is a vendor sales tracking app. All data is stored locally on-device.
> To test the full app, create an event (e.g. "Test Market", booth fee $50, travel $20),
> then add a few sales from the event detail screen. The Dashboard and Stats tabs will
> populate automatically. Premium features can be tested with the sandbox account provided.

---

## Privacy Nutrition Label (App Store Connect)

**Data NOT Collected:**
VendStats stores all data locally on the device using MMKV/AsyncStorage. No user data is transmitted to our servers.

**Third-Party SDKs:**
- RevenueCat — processes subscription purchases (Apple handles payment data)
- No analytics, advertising, or tracking SDKs

**Data categories to mark as "Not Collected":**
- Contact Info ✗
- Health & Fitness ✗
- Financial Info ✗
- Location ✗
- Sensitive Info ✗
- Contacts ✗
- User Content ✗
- Browsing History ✗
- Search History ✗
- Identifiers ✗
- Usage Data ✗
- Diagnostics ✗

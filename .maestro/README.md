# VendStats E2E Tests (Maestro)

Automated UI tests using [Maestro](https://maestro.mobile.dev/).

## Setup

1. Install Maestro CLI:
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

2. Add to PATH (restart terminal or run):
```bash
export PATH="$PATH":"$HOME/.maestro/bin"
```

3. Verify installation:
```bash
maestro --version
```

## Running Tests

### Prerequisites
- iOS Simulator running with the app installed
- App must be running in Expo Go or dev client

### Run All Tests
```bash
npm run test:e2e
# or
maestro test .maestro/flows/
```

### Run Specific Test
```bash
# Onboarding flow
maestro test .maestro/flows/01_onboarding.yaml

# Full regression
maestro test .maestro/flows/00_full_regression.yaml

# Tab navigation
maestro test .maestro/flows/04_tab_navigation.yaml
```

### Run with Video Recording
```bash
maestro record .maestro/flows/00_full_regression.yaml
```

## Test Flows

| File | Description |
|------|-------------|
| `00_full_regression.yaml` | Complete app regression test |
| `01_onboarding.yaml` | Full onboarding swipe-through |
| `02_skip_onboarding.yaml` | Skip button works |
| `03_create_event_and_sale.yaml` | Create event → add sale |
| `04_tab_navigation.yaml` | All tabs are accessible |
| `05_quick_sale.yaml` | Quick sale item creation |
| `06_settings_paywall.yaml` | Settings and paywall screens |

## Writing New Tests

Maestro uses simple YAML syntax:

```yaml
appId: host.exp.Exponent
---
- launchApp
- tapOn: "Button Text"
- inputText: "Some text"
- assertVisible: "Expected text"
- scroll:
    direction: DOWN
```

See [Maestro docs](https://maestro.mobile.dev/getting-started/writing-your-first-flow) for full reference.

## CI Integration

For GitHub Actions, see [Maestro Cloud](https://cloud.mobile.dev/) or run locally:

```yaml
- name: Run E2E Tests
  run: |
    curl -Ls "https://get.maestro.mobile.dev" | bash
    export PATH="$PATH":"$HOME/.maestro/bin"
    maestro test .maestro/flows/
```

## Troubleshooting

### "No simulator found"
Make sure iOS Simulator is running with Expo Go open.

### "App not found"
Update `appId` in the YAML files:
- Expo Go: `host.exp.Exponent`
- Dev client: `com.vendstats.app`

### Tests failing randomly
Add `- wait: 1000` (1 second) between actions for slower animations.

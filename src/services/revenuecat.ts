/**
 * RevenueCat Service
 * Handles subscriptions with Expo Go fallback
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { REVENUECAT_CONFIG, isRevenueCatConfigured, getConfigStatus } from '../config/revenuecat';
import { activateSubscription, expireSubscription, hasPremiumAccess } from '../storage';

// Check if we're in Expo Go (can't use native modules)
const isExpoGo = Constants.appOwnership === 'expo';

const revenueCatPlatform = (): 'ios' | 'android' =>
  Platform.OS === 'ios' ? 'ios' : 'android';

const revenueCatApiKeyName = (platform: 'ios' | 'android'): string =>
  platform === 'ios'
    ? 'EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY'
    : 'EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY';

// Type definitions for RevenueCat (avoid importing types from native module)
export interface MockPackage {
  identifier: string;
  product: {
    identifier: string;
    priceString: string;
    title: string;
  };
}

export interface MockOffering {
  identifier: string;
  availablePackages: MockPackage[];
}

export interface PurchaseError {
  code: 'EXPO_GO' | 'NOT_CONFIGURED' | 'PURCHASE_FAILED' | 'UNKNOWN';
  message: string;
  userCancelled?: boolean;
  details?: unknown;
}

/**
 * Initialize RevenueCat SDK
 * Call this once at app startup
 */
export const initializeRevenueCat = async (): Promise<void> => {
  if (isExpoGo) {
    console.log('🚧 Skipping RevenueCat in Expo Go - use development build for real purchases');
    return;
  }

  const platform = revenueCatPlatform();

  if (!isRevenueCatConfigured(platform)) {
    console.warn('⚠️ RevenueCat not configured - add API key to .env file. Using demo mode.');
    console.log('Config status:', getConfigStatus());
    return;
  }

  try {
    // Dynamic import to avoid loading native module in Expo Go
    const { default: Purchases, LOG_LEVEL } = await import('react-native-purchases');
    
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    
    const apiKey = platform === 'ios'
      ? REVENUECAT_CONFIG.apiKeys.apple 
      : REVENUECAT_CONFIG.apiKeys.google;
    
    await Purchases.configure({ apiKey });
    console.log('✅ RevenueCat initialized successfully');
  } catch (error) {
    console.error('❌ RevenueCat initialization failed:', error);
  }
};

/**
 * Get available subscription offerings
 */
export const getOfferings = async (): Promise<MockOffering | null> => {
  if (isExpoGo) {
    console.log('🚧 Returning mock offerings for Expo Go');
    // Return mock offerings for Expo Go testing
    return {
      identifier: 'default',
      availablePackages: [
        {
          identifier: '$rc_monthly',
          product: {
            identifier: 'vendstats_monthly_499',
            priceString: '$4.99',
            title: 'VendStats Pro Monthly',
          },
        },
        {
          identifier: '$rc_annual',
          product: {
            identifier: 'vendstats_yearly_2999',
            priceString: '$29.99',
            title: 'VendStats Pro Yearly',
          },
        },
      ],
    };
  }

  if (!isRevenueCatConfigured(revenueCatPlatform())) {
    console.warn('RevenueCat not configured - no offerings available');
    return null;
  }

  try {
    const { default: Purchases } = await import('react-native-purchases');
    const offerings = await Purchases.getOfferings();
    
    if (offerings.current !== null) {
      return offerings.current as unknown as MockOffering;
    }
    console.warn('No current offering available from RevenueCat');
    return null;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
};

/**
 * Purchase a subscription package
 */
export const purchasePackage = async (
  packageToPurchase: MockPackage
): Promise<{ success: boolean; customerInfo?: any; error?: PurchaseError }> => {
  if (isExpoGo) {
    console.log('🚧 Purchase requested in Expo Go - purchase sheet is unavailable');
    return {
      success: false,
      error: {
        code: 'EXPO_GO',
        message: 'Apple purchase sheet is not available in Expo Go. Use a development build, TestFlight, or App Store build.',
      },
    };
  }

  const platform = revenueCatPlatform();

  if (!isRevenueCatConfigured(platform)) {
    console.warn('RevenueCat not configured - cannot process purchase');
    return {
      success: false,
      error: {
        code: 'NOT_CONFIGURED',
        message: `RevenueCat is not configured. Add ${revenueCatApiKeyName(platform)} and rebuild the app.`,
        details: getConfigStatus(),
      },
    };
  }

  try {
    const { default: Purchases } = await import('react-native-purchases');
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase as any);
    
    if (customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementID]) {
      activateSubscription();
      return { success: true, customerInfo };
    }
    
    return {
      success: false,
      error: {
        code: 'PURCHASE_FAILED',
        message: 'Purchase completed but no active entitlement was detected.',
      },
    };
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error('Purchase error:', error);
    }
    return {
      success: false,
      error: {
        code: 'PURCHASE_FAILED',
        message: error?.message || 'Purchase failed before Apple sheet completed.',
        userCancelled: !!error?.userCancelled,
        details: error,
      },
    };
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<{ 
  success: boolean; 
  hasActiveSubscription: boolean;
}> => {
  if (isExpoGo) {
    console.log('🚧 Mock restore in Expo Go');
    return { success: true, hasActiveSubscription: false };
  }

  if (!isRevenueCatConfigured(revenueCatPlatform())) {
    console.warn('RevenueCat not configured - cannot restore purchases');
    return { success: false, hasActiveSubscription: false };
  }

  try {
    const { default: Purchases } = await import('react-native-purchases');
    const customerInfo = await Purchases.restorePurchases();
    
    const hasActive = customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementID] !== undefined;
    
    if (hasActive) {
      activateSubscription();
    } else {
      expireSubscription();
    }
    
    return { success: true, hasActiveSubscription: hasActive };
  } catch (error) {
    console.error('Restore error:', error);
    return { success: false, hasActiveSubscription: false };
  }
};

/**
 * Check current subscription status
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  if (isExpoGo) {
    // In Expo Go, check local storage
    return hasPremiumAccess();
  }

  if (!isRevenueCatConfigured(revenueCatPlatform())) {
    return false;
  }

  try {
    const { default: Purchases } = await import('react-native-purchases');
    const customerInfo = await Purchases.getCustomerInfo();
    const hasActive = customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementID] !== undefined;
    
    if (hasActive) {
      activateSubscription();
    } else {
      expireSubscription();
    }
    
    return hasActive;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};

/**
 * Get customer info (subscription details, expiration dates, etc.)
 */
export const getCustomerInfo = async (): Promise<any | null> => {
  if (isExpoGo) {
    return null;
  }

  if (!isRevenueCatConfigured(revenueCatPlatform())) {
    return null;
  }

  try {
    const { default: Purchases } = await import('react-native-purchases');
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Error getting customer info:', error);
    return null;
  }
};

/**
 * Set up listener for subscription changes
 */
export const addCustomerInfoUpdateListener = (): void => {
  if (isExpoGo) {
    console.log('🚧 Skipping RevenueCat listener in Expo Go');
    return;
  }

  if (!isRevenueCatConfigured(revenueCatPlatform())) {
    console.log('Skipping RevenueCat listener because RevenueCat is not configured');
    return;
  }

  import('react-native-purchases').then(({ default: Purchases }) => {
    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      const hasActive = customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlementID] !== undefined;
      
      if (hasActive) {
        activateSubscription();
        console.log('✅ Subscription activated');
      } else {
        expireSubscription();
        console.log('⚠️ Subscription expired');
      }
    });
  }).catch(console.error);
};

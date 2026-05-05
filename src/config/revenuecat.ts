/**
 * Environment Configuration
 * Handles RevenueCat keys and product IDs safely
 */

// Environment variables (set these in your build process)
const REVENUECAT_APPLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY;
const REVENUECAT_GOOGLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY;

export const REVENUECAT_CONFIG = {
  apiKeys: {
    apple: REVENUECAT_APPLE_API_KEY || '',
    google: REVENUECAT_GOOGLE_API_KEY || '',
  },
  
  entitlementID: 'pro',
  
  products: {
    monthly: 'monthly',
    yearly: 'yearly',
    lifetime: 'lifetime',
  },
} as const;

const isValidRevenueCatKey = (key: string, prefixes: string[]): boolean =>
  key.length > 0 && !key.includes('YOUR_') && prefixes.some((prefix) => key.startsWith(prefix));

/**
 * Check if RevenueCat is properly configured for a specific platform.
 */
export const isRevenueCatConfigured = (platform: 'ios' | 'android' = 'ios'): boolean => {
  const key = platform === 'ios'
    ? REVENUECAT_CONFIG.apiKeys.apple
    : REVENUECAT_CONFIG.apiKeys.google;
  const validPrefixes = platform === 'ios' ? ['appl_', 'sk_'] : ['goog_'];
  const isValidKey = isValidRevenueCatKey(key, validPrefixes);

  console.log('RevenueCat Config Check:', {
    platform,
    hasKey: !!key,
    keyLength: key?.length,
    keyPrefix: key?.substring(0, 5),
    isValid: isValidKey
  });

  return isValidKey;
};

/**
 * Get configuration status for debugging
 */
export const getConfigStatus = () => {
  return {
    hasAppleKey: !!REVENUECAT_CONFIG.apiKeys.apple && REVENUECAT_CONFIG.apiKeys.apple.length > 0,
    hasGoogleKey: !!REVENUECAT_CONFIG.apiKeys.google && REVENUECAT_CONFIG.apiKeys.google.length > 0,
    isAppleConfigured: isRevenueCatConfigured('ios'),
    isGoogleConfigured: isRevenueCatConfigured('android'),
    entitlementID: REVENUECAT_CONFIG.entitlementID,
    products: REVENUECAT_CONFIG.products,
    appleKeyPrefix: REVENUECAT_CONFIG.apiKeys.apple?.substring(0, 10) + '...',
    googleKeyPrefix: REVENUECAT_CONFIG.apiKeys.google?.substring(0, 10) + '...',
  };
};

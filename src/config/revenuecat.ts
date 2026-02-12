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

/**
 * Check if RevenueCat is properly configured
 */
export const isRevenueCatConfigured = (): boolean => {
  const appleKey = REVENUECAT_CONFIG.apiKeys.apple;
  const isValidKey = appleKey.length > 0 && 
    !appleKey.includes('YOUR_') && 
    (appleKey.startsWith('appl_') || appleKey.startsWith('sk_'));
  
  console.log('RevenueCat Config Check:', {
    hasKey: !!appleKey,
    keyLength: appleKey?.length,
    keyPrefix: appleKey?.substring(0, 5),
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
    isConfigured: isRevenueCatConfigured(),
    entitlementID: REVENUECAT_CONFIG.entitlementID,
    products: REVENUECAT_CONFIG.products,
    appleKeyPrefix: REVENUECAT_CONFIG.apiKeys.apple?.substring(0, 10) + '...',
  };
};

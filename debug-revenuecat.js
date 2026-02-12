#!/usr/bin/env node

/**
 * RevenueCat Configuration Debug Tool
 * Run this to check your RevenueCat setup
 */

// Simulate environment loading
require('dotenv').config();

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY;

console.log('🔍 RevenueCat Configuration Debug\n');

console.log('📋 Environment Check:');
console.log(`API Key exists: ${!!API_KEY}`);
console.log(`API Key length: ${API_KEY ? API_KEY.length : 0}`);
console.log(`API Key prefix: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'N/A'}`);

const isValidKey = API_KEY && 
  API_KEY.length > 0 && 
  !API_KEY.includes('YOUR_') && 
  (API_KEY.startsWith('appl_') || API_KEY.startsWith('sk_'));

console.log(`Valid format: ${isValidKey}\n`);

console.log('📦 Expected Products:');
console.log('- vendstats_monthly_499 ($4.99/month)');
console.log('- vendstats_yearly_2999 ($29.99/year)\n');

console.log('🎯 Expected Entitlement:');
console.log('- pro (attach both products to this entitlement)\n');

if (isValidKey) {
  console.log('✅ Configuration looks correct!');
  console.log('\n🚨 If you\'re still seeing "RC test" products:');
  console.log('1. Products not created in RevenueCat dashboard');
  console.log('2. Products not attached to "pro" entitlement');
  console.log('3. App might be in sandbox/test mode');
  console.log('\n📖 Check the RevenueCat dashboard:');
  console.log('- Products tab: Create vendstats_monthly_499 & vendstats_yearly_2999');
  console.log('- Entitlements tab: Create "pro" and attach both products');
  console.log('- Overview tab: Verify products show as active');
} else {
  console.log('❌ Configuration issue detected!');
  console.log('\n🔧 To fix:');
  console.log('1. Get API key from RevenueCat dashboard');
  console.log('2. Update your .env file');
  console.log('3. Restart your development server');
}

console.log('\n🏃‍♂️ Run this debug in your app:');
console.log('```javascript');
console.log('import { getConfigStatus } from "./src/config/revenuecat";');
console.log('console.log("Config:", getConfigStatus());');
console.log('```');
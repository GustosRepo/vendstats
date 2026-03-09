/**
 * Currency formatting utilities
 * Consistent currency display throughout the app
 */

import { getCurrency } from '../storage/settings';

const CURRENCY_LOCALE_MAP: Record<string, string> = {
  USD: 'en-US',
  THB: 'th-TH',
  MXN: 'es-MX',
  EUR: 'de-DE',
};

/**
 * Get the user's saved currency + matching locale
 */
const getUserCurrency = (): { currency: string; locale: string } => {
  try {
    const currency = getCurrency();
    return { currency, locale: CURRENCY_LOCALE_MAP[currency] || 'en-US' };
  } catch {
    return { currency: 'USD', locale: 'en-US' };
  }
};

/**
 * Format a number as currency
 */
export const formatCurrency = (
  amount: number,
  options?: {
    currency?: string;
    locale?: string;
    showCents?: boolean;
  }
): string => {
  const userPrefs = getUserCurrency();
  const {
    currency = userPrefs.currency,
    locale = userPrefs.locale,
    showCents = true,
  } = options || {};

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });

  return formatter.format(amount);
};

/**
 * Format currency with sign (+ or -)
 */
export const formatCurrencyWithSign = (amount: number): string => {
  const formatted = formatCurrency(Math.abs(amount));
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
};

/**
 * Format as compact currency (e.g., $1.2K)
 */
export const formatCompactCurrency = (amount: number): string => {
  const { currency, locale } = getUserCurrency();
  const symbol = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(0).find(p => p.type === 'currency')?.value || '$';
  if (Math.abs(amount) >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

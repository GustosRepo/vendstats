/**
 * Locale-aware date formatting utilities
 * Wraps date-fns format() to automatically apply the current app language locale
 */

import { format as dateFnsFormat, type Locale } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { th } from 'date-fns/locale/th';
import { es } from 'date-fns/locale/es';
import i18n from 'i18next';

const localeMap: Record<string, Locale> = {
  en: enUS,
  th: th,
  es: es,
};

/**
 * Format a date with the current app language locale.
 * Drop-in replacement for date-fns `format()`.
 */
export const formatDate = (date: Date | number, formatStr: string): string => {
  const locale = localeMap[i18n.language] || enUS;
  return dateFnsFormat(date, formatStr, { locale });
};

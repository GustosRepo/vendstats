import { mmkvStorage } from './mmkv';
import { AppSettings, DEFAULT_SETTINGS, STORAGE_KEYS } from '../types';

// Get all app settings
export const getAppSettings = (): AppSettings => {
  const settings = mmkvStorage.getJSON<AppSettings>(STORAGE_KEYS.SETTINGS);
  return settings || DEFAULT_SETTINGS;
};

// Update app settings
export const updateAppSettings = (updates: Partial<AppSettings>): AppSettings => {
  const current = getAppSettings();
  const updated = { ...current, ...updates };
  mmkvStorage.setJSON(STORAGE_KEYS.SETTINGS, updated);
  return updated;
};

// Get low stock threshold
export const getLowStockThreshold = (): number => {
  const settings = getAppSettings();
  return settings.lowStockThreshold;
};

// Set low stock threshold
export const setLowStockThreshold = (threshold: number): void => {
  updateAppSettings({ lowStockThreshold: threshold });
};

// Get saved language preference
export const getLanguage = (): string | undefined => {
  const settings = getAppSettings();
  return settings.language;
};

// Set language preference
export const setLanguage = (language: string): void => {
  updateAppSettings({ language });
};

// Get QR code URI
export const getQrCodeUri = (): string | undefined => {
  const settings = getAppSettings();
  return settings.qrCodeUri;
};

// Set QR code URI
export const setQrCodeUri = (uri: string | undefined): void => {
  updateAppSettings({ qrCodeUri: uri });
};

// Get vendor category
export const getVendorCategory = (): string | undefined => {
  const settings = getAppSettings();
  return settings.vendorCategory;
};

// Set vendor category
export const setVendorCategory = (category: string): void => {
  updateAppSettings({ vendorCategory: category as any });
};

// Get saved currency preference
export const getCurrency = (): string => {
  const settings = getAppSettings();
  return settings.currency || 'USD';
};

// Set currency preference
export const setCurrency = (currency: string): void => {
  updateAppSettings({ currency });
};

// Get reminder setting
export const getReminderEnabled = (): boolean => {
  const settings = getAppSettings();
  return settings.reminderEnabled || false;
};

// Set reminder setting
export const setReminderEnabled = (enabled: boolean): void => {
  updateAppSettings({ reminderEnabled: enabled });
};

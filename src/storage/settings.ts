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

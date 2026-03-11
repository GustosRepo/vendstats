import * as FileSystem from 'expo-file-system';
import { getQuickSaleItems } from './sales';
import { mmkvStorage} from './mmkv';
import { STORAGE_KEYS, QuickSaleItem } from '../types';

const MIGRATION_KEY = 'migration_images_v1';

/**
 * One-time migration: validate all product image URIs.
 * - If an image file no longer exists on disk (temp URI wiped by iOS update),
 *   clear the imageUri so the UI shows the placeholder instead of a broken image.
 * - Runs only once (flagged via MIGRATION_KEY).
 */
export const migrateProductImages = async (): Promise<boolean> => {
  // Skip if already migrated
  if (mmkvStorage.getBoolean(MIGRATION_KEY)) return false;

  try {
    const items = getQuickSaleItems();
    let changed = false;

    const updated: QuickSaleItem[] = await Promise.all(
      items.map(async (item) => {
        if (!item.imageUri) return item;

        try {
          const info = await FileSystem.getInfoAsync(item.imageUri);
          if (!info.exists) {
            changed = true;
            return { ...item, imageUri: undefined };
          }
        } catch {
          // URI is invalid / unreadable — clear it
          changed = true;
          return { ...item, imageUri: undefined };
        }

        return item;
      })
    );

    if (changed) {
      mmkvStorage.setJSON(STORAGE_KEYS.QUICK_ITEMS, updated);
    }

    // Mark as done
    mmkvStorage.setBoolean(MIGRATION_KEY, true);
    return changed;
  } catch (error) {
    console.warn('Image migration failed:', error);
    mmkvStorage.setBoolean(MIGRATION_KEY, true);
    return false;
  }
};

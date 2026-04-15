import * as FileSystem from 'expo-file-system';
import { getQuickSaleItems } from './sales';
import { mmkvStorage} from './mmkv';
import { STORAGE_KEYS, QuickSaleItem } from '../types';

// v1 — clear broken absolute URIs
// v2 — convert surviving absolute URIs to relative paths
const MIGRATION_KEY = 'migration_images_v2';

const PRODUCT_IMAGES_RELATIVE_DIR = 'product-images/';

/**
 * One-time migration: validate all product image URIs and convert legacy
 * absolute paths to relative ones so they survive future UUID changes.
 * - Clears imageUri if the file no longer exists on disk.
 * - Converts absolute paths that still exist to portable relative paths.
 * - Runs only once (flagged via MIGRATION_KEY).
 */
export const migrateProductImages = async (): Promise<boolean> => {
  // Skip if already at v2
  if (mmkvStorage.getBoolean(MIGRATION_KEY)) return false;

  try {
    const items = getQuickSaleItems();
    let changed = false;
    let lostCount = 0; // tracks actual data loss (file gone), not conversions

    const updated: QuickSaleItem[] = await Promise.all(
      items.map(async (item) => {
        if (!item.imageUri) return item;

        // Already a relative path — nothing to do
        if (item.imageUri.startsWith(PRODUCT_IMAGES_RELATIVE_DIR)) {
          return item;
        }

        // Legacy absolute path — check if the file still exists
        try {
          const info = await FileSystem.getInfoAsync(item.imageUri);
          if (!info.exists) {
            // File is gone (UUID change) — clear it and count as lost
            lostCount++;
            changed = true;
            return { ...item, imageUri: undefined };
          }

          // File exists — convert to relative path for portability (not a loss)
          const docDir = FileSystem.documentDirectory ?? '';
          const relative = item.imageUri.startsWith(docDir)
            ? item.imageUri.slice(docDir.length)
            : item.imageUri;
          changed = true;
          return { ...item, imageUri: relative };
        } catch {
          // URI is invalid / unreadable — clear it and count as lost
          lostCount++;
          changed = true;
          return { ...item, imageUri: undefined };
        }
      })
    );

    if (changed) {
      mmkvStorage.setJSON(STORAGE_KEYS.QUICK_ITEMS, updated);
    }

    mmkvStorage.setBoolean(MIGRATION_KEY, true);
    // Only return true (triggering the alert) when photos were actually lost
    return lostCount > 0;
  } catch (error) {
    console.warn('Image migration failed:', error);
    mmkvStorage.setBoolean(MIGRATION_KEY, true);
    return false;
  }
};

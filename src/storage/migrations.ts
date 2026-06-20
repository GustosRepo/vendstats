import * as FileSystem from 'expo-file-system/legacy';
import { getQuickSaleItems } from './sales';
import { mmkvStorage} from './mmkv';
import { STORAGE_KEYS, QuickSaleItem } from '../types';

// v1 — legacy image migration
// v2 — convert provably safe absolute URIs to relative paths
const MIGRATION_KEY = 'migration_images_v2';

const PRODUCT_IMAGES_RELATIVE_DIR = 'product-images/';

/**
 * One-time migration: convert legacy documentDirectory image URIs to relative
 * paths so they survive future app-container UUID changes.
 *
 * This is intentionally non-destructive: if a URI cannot be verified or cannot
 * be converted safely, keep the stored value instead of clearing it.
 */
export const migrateProductImages = async (): Promise<boolean> => {
  // Skip if already at v2
  if (mmkvStorage.getBoolean(MIGRATION_KEY)) return false;

  try {
    const items = getQuickSaleItems();
    let changed = false;

    const updated: QuickSaleItem[] = await Promise.all(
      items.map(async (item) => {
        if (!item.imageUri) return item;

        // Already a relative path — nothing to do
        if (item.imageUri.startsWith(PRODUCT_IMAGES_RELATIVE_DIR)) {
          return item;
        }

        // Legacy absolute path in our document directory — convert to relative.
        try {
          const docDir = FileSystem.documentDirectory ?? '';
          if (!docDir || !item.imageUri.startsWith(docDir)) {
            return item;
          }

          const info = await FileSystem.getInfoAsync(item.imageUri);
          if (!info.exists) {
            return item;
          }

          const relative = item.imageUri.slice(docDir.length);
          changed = true;
          return { ...item, imageUri: relative };
        } catch {
          return item;
        }
      })
    );

    if (changed) {
      mmkvStorage.setJSON(STORAGE_KEYS.QUICK_ITEMS, updated);
    }

    mmkvStorage.setBoolean(MIGRATION_KEY, true);
    return false;
  } catch (error) {
    console.warn('Image migration failed:', error);
    return false;
  }
};

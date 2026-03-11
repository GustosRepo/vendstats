import * as FileSystem from 'expo-file-system';

const PRODUCT_IMAGES_DIR = `${FileSystem.documentDirectory}product-images/`;

/**
 * Copy an image from a temporary URI (e.g. ImagePicker cache) to the
 * permanent documents directory so it survives app updates.
 * Returns the new persistent URI, or the original if it's already persisted.
 */
export const persistProductImage = async (tempUri: string): Promise<string> => {
  // Already in our permanent directory — nothing to do
  if (tempUri.startsWith(PRODUCT_IMAGES_DIR)) {
    return tempUri;
  }

  // Ensure the directory exists
  const dirInfo = await FileSystem.getInfoAsync(PRODUCT_IMAGES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PRODUCT_IMAGES_DIR, { intermediates: true });
  }

  // Derive extension from source URI, default to .jpg
  const ext = tempUri.match(/\.\w+$/)?.[0] || '.jpg';
  const filename = `product_${Date.now()}${ext}`;
  const destUri = `${PRODUCT_IMAGES_DIR}${filename}`;

  await FileSystem.copyAsync({ from: tempUri, to: destUri });
  return destUri;
};

/**
 * Delete a persisted product image (e.g. when replacing or removing).
 * Silently ignores files outside our directory or already-deleted files.
 */
export const deleteProductImage = async (uri: string): Promise<void> => {
  if (!uri.startsWith(PRODUCT_IMAGES_DIR)) return;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch {
    // Best-effort cleanup
  }
};

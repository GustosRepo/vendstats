import * as FileSystem from 'expo-file-system';

const PRODUCT_IMAGES_RELATIVE_DIR = 'product-images/';
const QR_RELATIVE_DIR = 'qr/';
const RECEIPTS_RELATIVE_DIR = 'receipts/';

const getProductImagesDir = (): string =>
  `${FileSystem.documentDirectory}${PRODUCT_IMAGES_RELATIVE_DIR}`;

// ---------------------------------------------------------------------------
// Generic resolver
// ---------------------------------------------------------------------------

/**
 * Converts any stored URI to a renderable full URI at call time.
 * - Relative path → prepend current documentDirectory
 * - Absolute file:// or /path/... → returned as-is (legacy or picker temp)
 * - null / undefined → returns undefined
 *
 * Call this at render time. Never store the result.
 */
export const resolveStoredUri = (stored: string | null | undefined): string | undefined => {
  if (!stored) return undefined;
  if (stored.startsWith('file://') || stored.startsWith('/')) return stored;
  return `${FileSystem.documentDirectory}${stored}`;
};

/**
 * Kept for backward compatibility — delegates to resolveStoredUri.
 * All existing call sites guard with a truthy check so the `?? stored`
 * fallback never fires in practice.
 */
export const resolveProductImageUri = (stored: string): string =>
  resolveStoredUri(stored) ?? stored;

// ---------------------------------------------------------------------------
// Generic delete
// ---------------------------------------------------------------------------

/**
 * Delete a stored file (relative path or legacy absolute).
 * Safe to call with null/undefined.
 * Only deletes files inside the app's own documentDirectory.
 */
export const deleteStoredFile = async (uri: string | null | undefined): Promise<void> => {
  if (!uri) return;
  const fullUri = resolveStoredUri(uri);
  if (!fullUri) return;
  const docDir = FileSystem.documentDirectory;
  // Safety: never delete outside our sandbox
  if (!docDir || !fullUri.startsWith(docDir)) return;
  try {
    const info = await FileSystem.getInfoAsync(fullUri);
    if (info.exists) {
      await FileSystem.deleteAsync(fullUri, { idempotent: true });
    }
  } catch {
    // Best-effort cleanup
  }
};

// ---------------------------------------------------------------------------
// Shared copy helper (private)
// ---------------------------------------------------------------------------

/**
 * Copy a temp picker URI into a permanent subdirectory and return its
 * relative path. Used by all persist* functions.
 */
const persistToDirectory = async (
  tempUri: string,
  relativeDir: string,
  filePrefix: string,
): Promise<string> => {
  // Already a relative path in our dir — nothing to do
  if (tempUri.startsWith(relativeDir)) return tempUri;

  const dir = `${FileSystem.documentDirectory}${relativeDir}`;

  // Legacy absolute path already in our dir — strip to relative
  if (tempUri.startsWith(dir)) {
    return tempUri.slice((FileSystem.documentDirectory ?? '').length);
  }

  // Ensure directory exists
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const ext = tempUri.match(/\.\w+$/)?.[0] || '.jpg';
  const relativePath = `${relativeDir}${filePrefix}_${Date.now()}${ext}`;
  await FileSystem.copyAsync({
    from: tempUri,
    to: `${FileSystem.documentDirectory}${relativePath}`,
  });
  return relativePath;
};

// ---------------------------------------------------------------------------
// Persist helpers
// ---------------------------------------------------------------------------

/**
 * Persist a product image to documentDirectory/product-images/.
 * Returns a relative path, e.g. "product-images/product_123.jpg".
 */
export const persistProductImage = async (tempUri: string): Promise<string> =>
  persistToDirectory(tempUri, PRODUCT_IMAGES_RELATIVE_DIR, 'product');

/**
 * Persist a QR code image to documentDirectory/qr/.
 * Returns a relative path, e.g. "qr/qr_123.jpg".
 */
export const persistQrImage = async (tempUri: string): Promise<string> =>
  persistToDirectory(tempUri, QR_RELATIVE_DIR, 'qr');

/**
 * Persist a receipt photo to documentDirectory/receipts/.
 * Returns a relative path, e.g. "receipts/receipt_123.jpg".
 */
export const persistReceiptPhoto = async (tempUri: string): Promise<string> =>
  persistToDirectory(tempUri, RECEIPTS_RELATIVE_DIR, 'receipt');

// ---------------------------------------------------------------------------
// Legacy alias — kept so any future direct callers don't break
// ---------------------------------------------------------------------------

/** @deprecated Use deleteStoredFile instead */
export const deleteProductImage = async (uri: string): Promise<void> =>
  deleteStoredFile(uri);

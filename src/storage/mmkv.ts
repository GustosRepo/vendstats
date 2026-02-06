import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache for synchronous-like access (populated on app start)
let cache: Record<string, string> = {};

// Initialize cache from AsyncStorage
export const initializeStorage = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    pairs.forEach(([key, value]) => {
      if (value !== null) {
        cache[key] = value;
      }
    });
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
};

// Generic storage helpers (Expo Go compatible using AsyncStorage)
export const mmkvStorage = {
  // String operations
  setString: (key: string, value: string): void => {
    cache[key] = value;
    AsyncStorage.setItem(key, value).catch(console.error);
  },

  getString: (key: string): string | undefined => {
    return cache[key];
  },

  // Number operations
  setNumber: (key: string, value: number): void => {
    const stringValue = value.toString();
    cache[key] = stringValue;
    AsyncStorage.setItem(key, stringValue).catch(console.error);
  },

  getNumber: (key: string): number | undefined => {
    const value = cache[key];
    if (value !== undefined) {
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    }
    return undefined;
  },

  // Boolean operations
  setBoolean: (key: string, value: boolean): void => {
    const stringValue = value ? 'true' : 'false';
    cache[key] = stringValue;
    AsyncStorage.setItem(key, stringValue).catch(console.error);
  },

  getBoolean: (key: string): boolean | undefined => {
    const value = cache[key];
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  },

  // JSON operations (for objects and arrays)
  setJSON: <T>(key: string, value: T): void => {
    const jsonString = JSON.stringify(value);
    cache[key] = jsonString;
    AsyncStorage.setItem(key, jsonString).catch(console.error);
  },

  getJSON: <T>(key: string): T | null => {
    const value = cache[key];
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    }
    return null;
  },

  // Delete operations
  delete: (key: string): void => {
    delete cache[key];
    AsyncStorage.removeItem(key).catch(console.error);
  },

  // Check if key exists
  contains: (key: string): boolean => {
    return key in cache;
  },

  // Get all keys
  getAllKeys: (): string[] => {
    return Object.keys(cache);
  },

  // Clear all data
  clearAll: (): void => {
    cache = {};
    AsyncStorage.clear().catch(console.error);
  },
};

// Backwards compatible export
export const storage = {
  set: (key: string, value: string | number | boolean) => {
    if (typeof value === 'string') {
      mmkvStorage.setString(key, value);
    } else if (typeof value === 'number') {
      mmkvStorage.setNumber(key, value);
    } else if (typeof value === 'boolean') {
      mmkvStorage.setBoolean(key, value);
    }
  },
  getString: mmkvStorage.getString,
  getNumber: mmkvStorage.getNumber,
  getBoolean: mmkvStorage.getBoolean,
  delete: mmkvStorage.delete,
  contains: mmkvStorage.contains,
  getAllKeys: mmkvStorage.getAllKeys,
  clearAll: mmkvStorage.clearAll,
};

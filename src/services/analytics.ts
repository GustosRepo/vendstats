import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo = Constants.appOwnership === 'expo';

let analyticsInitialized = false;

export const initializeAnalytics = async (): Promise<void> => {
  if (analyticsInitialized || Platform.OS === 'web') {
    return;
  }

  if (isExpoGo) {
    console.log('Skipping Firebase Analytics in Expo Go - use a development or production build.');
    return;
  }

  try {
    const analyticsModule = await import('@react-native-firebase/analytics');
    const analytics = analyticsModule.default();

    await analytics.setAnalyticsCollectionEnabled(true);
    analyticsInitialized = true;
    console.log('Firebase Analytics initialized successfully');
  } catch (error) {
    console.warn('Firebase Analytics initialization failed:', error);
  }
};

export const logAnalyticsEvent = async (
  name: string,
  params?: Record<string, string | number | boolean | null | undefined>
): Promise<void> => {
  if (!analyticsInitialized || Platform.OS === 'web' || isExpoGo) {
    return;
  }

  try {
    const analyticsModule = await import('@react-native-firebase/analytics');
    const analytics = analyticsModule.default();

    await analytics.logEvent(name, params);
  } catch (error) {
    console.warn(`Firebase Analytics event failed: ${name}`, error);
  }
};
import 'react-native-get-random-values'; // Must be first - polyfill for uuid
import './src/i18n'; // Initialize i18n before anything renders
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { initializeStorage } from './src/storage/mmkv';
import { initializeRevenueCat, addCustomerInfoUpdateListener } from './src/services/revenuecat';
import { restoreLanguage } from './src/i18n';
import { migrateProductImages } from './src/storage/migrations';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Initialize storage cache
      await initializeStorage();
      
      // Restore saved language now that storage is ready
      await restoreLanguage();
      
      // Clean up broken product image URIs from prior updates
      const imagesWereCleaned = await migrateProductImages();
      
      // Initialize RevenueCat
      await initializeRevenueCat();
      
      // Set up subscription listener
      addCustomerInfoUpdateListener();
      
      setIsReady(true);

      // Show one-time alert if broken images were cleaned up
      if (imagesWereCleaned) {
        // Small delay so the UI renders first
        setTimeout(() => {
          const i18n = require('./src/i18n').default;
          const t = i18n.t.bind(i18n);
          Alert.alert(
            t('migration.photosTitle'),
            t('migration.photosMessage'),
            [{ text: t('migration.photosButton'), style: 'default' }]
          );
        }, 500);
      }
    };

    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F1F8' }}>
        <ActivityIndicator size="large" color="#1B4332" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

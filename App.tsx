import 'react-native-get-random-values'; // Must be first - polyfill for uuid
import './src/i18n'; // Initialize i18n before anything renders
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { initializeStorage } from './src/storage/mmkv';
import { initializeRevenueCat, addCustomerInfoUpdateListener } from './src/services/revenuecat';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Initialize storage cache
      await initializeStorage();
      
      // Initialize RevenueCat
      await initializeRevenueCat();
      
      // Set up subscription listener
      addCustomerInfoUpdateListener();
      
      setIsReady(true);
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

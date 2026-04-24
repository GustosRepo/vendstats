import React from 'react';
import { Platform, View } from 'react-native';
import { hasPremiumAccess } from '../storage';

// Only import ad SDK on Android to avoid any iOS impact
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

if (Platform.OS === 'android') {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  TestIds = ads.TestIds;
}

// Replace with your real AdMob banner unit ID after AdMob approval
const PRODUCTION_BANNER_ID = 'ca-app-pub-8863066373093222/1747009744';

const getAdUnitId = () => {
  if (__DEV__) return TestIds?.BANNER ?? PRODUCTION_BANNER_ID;
  return PRODUCTION_BANNER_ID;
};

export const AdBanner: React.FC = () => {
  // Never show on iOS
  if (Platform.OS !== 'android') return null;

  // Never show to paying subscribers
  if (hasPremiumAccess()) return null;

  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <BannerAd
        unitId={getAdUnitId()}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
};

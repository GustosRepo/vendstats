const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Custom config plugin to inject AdMob App ID into AndroidManifest.xml.
 * Replaces the broken built-in react-native-google-mobile-ads plugin for Expo 50.
 */
const withAdmob = (config, { androidAppId }) => {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults;
    const application = manifest.manifest.application[0];

    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    // Remove any existing AdMob entry to avoid duplicates
    application['meta-data'] = application['meta-data'].filter(
      (item) => item.$?.['android:name'] !== 'com.google.android.gms.ads.APPLICATION_ID'
    );

    // Add the AdMob App ID
    application['meta-data'].push({
      $: {
        'android:name': 'com.google.android.gms.ads.APPLICATION_ID',
        'android:value': androidAppId,
      },
    });

    return modConfig;
  });
};

module.exports = withAdmob;

const { AndroidConfig, withAndroidManifest, withProjectBuildGradle } = require('@expo/config-plugins');

const GOOGLE_MOBILE_ADS_FORCE_MARKER = '// @vendstats-force-google-mobile-ads-version';

/**
 * Custom config plugin to inject AdMob App ID into AndroidManifest.xml.
 * Replaces the broken built-in react-native-google-mobile-ads plugin for Expo 50.
 */
const withAdmob = (config, { androidAppId, googleMobileAdsVersion = '24.6.0' }) => {
  config = withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults;
    AndroidConfig.Manifest.ensureToolsAvailable(manifest);
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
        'tools:replace': 'android:value',
      },
    });

    return modConfig;
  });

  return withProjectBuildGradle(config, (modConfig) => {
    if (!modConfig.modResults.contents.includes(GOOGLE_MOBILE_ADS_FORCE_MARKER)) {
      modConfig.modResults.contents += `

${GOOGLE_MOBILE_ADS_FORCE_MARKER}
subprojects { subproject ->
    subproject.configurations.configureEach {
        resolutionStrategy.force "com.google.android.gms:play-services-ads:${googleMobileAdsVersion}"
    }
}
`;
    }

    return modConfig;
  });
};

module.exports = withAdmob;

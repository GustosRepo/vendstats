import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { en, th, es } from './locales';
import { getAppSettings } from '../storage/settings';

export type SupportedLanguage = 'en' | 'th' | 'es';

export const LANGUAGES: { code: SupportedLanguage; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'th', label: 'Thai', nativeLabel: 'ไทย' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
];

// Determine initial language: saved preference > device locale > English
const getInitialLanguage = (): SupportedLanguage => {
  try {
    const settings = getAppSettings();
    if (settings.language && ['en', 'th', 'es'].includes(settings.language)) {
      return settings.language as SupportedLanguage;
    }
  } catch {
    // Settings not available yet, fall through to device locale
  }

  // Check device locale
  const deviceLocale = Localization.getLocales()?.[0]?.languageCode || 'en';
  if (['en', 'th', 'es'].includes(deviceLocale)) {
    return deviceLocale as SupportedLanguage;
  }

  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      th: { translation: th },
      es: { translation: es },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    // Disable nesting to avoid issues with special chars
    compatibilityJSON: 'v4',
  });

export const changeLanguage = async (lang: SupportedLanguage) => {
  await i18n.changeLanguage(lang);
};

export default i18n;

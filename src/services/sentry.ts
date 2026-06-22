import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

let sentryInitialized = false;

export const initializeSentry = (): void => {
  if (sentryInitialized || !sentryDsn || Platform.OS === 'web') {
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    enabled: Boolean(sentryDsn),
    tracesSampleRate: 0.1,
    attachStacktrace: true,
  });

  sentryInitialized = true;
};

export const captureTestSentryEvent = (): string | null => {
  if (!sentryDsn || Platform.OS === 'web') {
    return null;
  }

  return Sentry.captureException(new Error('VendStats Sentry test event'));
};

export const wrapWithSentry = <T extends React.ComponentType<any>>(component: T): T => {
  if (!sentryDsn || Platform.OS === 'web') {
    return component;
  }

  return Sentry.wrap(component) as T;
};
import { mmkvStorage } from './mmkv';

const ONBOARDING_KEY = 'hasSeenOnboarding';

export const hasSeenOnboarding = (): boolean => {
  return mmkvStorage.getBoolean(ONBOARDING_KEY) ?? false;
};

export const setOnboardingComplete = (): void => {
  mmkvStorage.setBoolean(ONBOARDING_KEY, true);
};

export const resetOnboarding = (): void => {
  mmkvStorage.delete(ONBOARDING_KEY);
};

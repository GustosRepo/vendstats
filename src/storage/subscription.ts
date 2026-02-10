import { mmkvStorage } from './mmkv';
import { SubscriptionState, STORAGE_KEYS } from '../types';
import { TRIAL_DURATION_DAYS, FREE_TIER_LIMITS } from '../constants';

const DEFAULT_SUBSCRIPTION_STATE: SubscriptionState = {
  status: 'none',
  trialStartDate: null,
  trialEndDate: null,
  isPremium: false,
};

// Get current subscription state
export const getSubscriptionState = (): SubscriptionState => {
  const state = mmkvStorage.getJSON<SubscriptionState>(STORAGE_KEYS.SUBSCRIPTION);
  return state || DEFAULT_SUBSCRIPTION_STATE;
};

// Save subscription state
export const saveSubscriptionState = (state: SubscriptionState): void => {
  mmkvStorage.setJSON(STORAGE_KEYS.SUBSCRIPTION, state);
};

// Start free trial
export const startFreeTrial = (): SubscriptionState => {
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);

  const state: SubscriptionState = {
    status: 'trial',
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    isPremium: true,
  };

  saveSubscriptionState(state);
  return state;
};

// Check if trial is active
export const isTrialActive = (): boolean => {
  const state = getSubscriptionState();

  if (state.status !== 'trial' || !state.trialEndDate) {
    return false;
  }

  return new Date() < new Date(state.trialEndDate);
};

// Get remaining trial days
export const getRemainingTrialDays = (): number => {
  const state = getSubscriptionState();

  if (state.status !== 'trial' || !state.trialEndDate) {
    return 0;
  }

  const now = new Date();
  const endDate = new Date(state.trialEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

// Mark subscription as active (called after RevenueCat purchase)
export const activateSubscription = (): SubscriptionState => {
  const state: SubscriptionState = {
    status: 'active',
    trialStartDate: null,
    trialEndDate: null,
    isPremium: true,
  };

  saveSubscriptionState(state);
  return state;
};

// Mark subscription as expired
export const expireSubscription = (): SubscriptionState => {
  const currentState = getSubscriptionState();

  const state: SubscriptionState = {
    ...currentState,
    status: 'expired',
    isPremium: false,
  };

  saveSubscriptionState(state);
  return state;
};

// Check if user has premium access (trial or active subscription)
export const hasPremiumAccess = (): boolean => {
  const state = getSubscriptionState();

  if (state.status === 'active') {
    return true;
  }

  if (state.status === 'trial') {
    return isTrialActive();
  }

  return false;
};

// Check if should show paywall
export const shouldShowPaywall = (hasCreatedEvent: boolean): boolean => {
  if (!hasCreatedEvent) {
    return false;
  }

  return !hasPremiumAccess();
};

// Reset subscription state (for testing or reset data)
export const resetSubscription = (): void => {
  saveSubscriptionState(DEFAULT_SUBSCRIPTION_STATE);
};

// Check if user can create an event (1 free event, then paywall)
export const canCreateEvent = (currentEventCount: number): boolean => {
  // Premium users can create unlimited events
  if (hasPremiumAccess()) {
    return true;
  }
  
  // Free users get limited events
  return currentEventCount < FREE_TIER_LIMITS.MAX_EVENTS;
};

// Check if paywall should show for event creation
export const shouldShowEventPaywall = (currentEventCount: number): boolean => {
  return !canCreateEvent(currentEventCount);
};

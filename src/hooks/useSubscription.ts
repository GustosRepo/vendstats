import { useState, useCallback, useEffect } from 'react';
import { 
  getSubscriptionState,
  hasPremiumAccess,
  isTrialActive,
  getRemainingTrialDays,
  startFreeTrial,
  activateSubscription,
  expireSubscription,
  shouldShowPaywall,
  hasCreatedFirstEvent,
} from '../storage';
import { SubscriptionState } from '../types';

/**
 * Hook for managing subscription state
 */
export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSubscription = useCallback(() => {
    setLoading(true);
    const state = getSubscriptionState();
    setSubscription(state);
    setIsPremium(hasPremiumAccess());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const startTrial = useCallback(() => {
    const state = startFreeTrial();
    setSubscription(state);
    setIsPremium(true);
    return state;
  }, []);

  const activate = useCallback(() => {
    const state = activateSubscription();
    setSubscription(state);
    setIsPremium(true);
    return state;
  }, []);

  const expire = useCallback(() => {
    const state = expireSubscription();
    setSubscription(state);
    setIsPremium(false);
    return state;
  }, []);

  const checkPaywall = useCallback(() => {
    const hasEvent = hasCreatedFirstEvent();
    return shouldShowPaywall(hasEvent);
  }, []);

  return {
    subscription,
    isPremium,
    loading,
    loadSubscription,
    startTrial,
    activate,
    expire,
    checkPaywall,
    isTrialActive: isTrialActive(),
    remainingTrialDays: getRemainingTrialDays(),
  };
};

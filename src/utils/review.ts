import * as StoreReview from 'expo-store-review';
import { mmkvStorage } from '../storage/mmkv';

const REVIEW_KEYS = {
  HAS_REQUESTED_REVIEW: 'vendstats_has_requested_review',
  REVIEW_REQUEST_DATE: 'vendstats_review_request_date',
  COMPLETED_EVENTS_COUNT: 'vendstats_completed_events_for_review',
} as const;

/**
 * Request an app store review at an appropriate time
 * - Only request once
 * - Only after meaningful app usage (completing first event)
 */
export const requestReviewIfAppropriate = async (): Promise<boolean> => {
  try {
    // Check if we've already requested a review
    const hasRequested = mmkvStorage.getBoolean(REVIEW_KEYS.HAS_REQUESTED_REVIEW);
    if (hasRequested) {
      return false;
    }

    // Check if the device supports in-app reviews
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      return false;
    }

    // Request the review
    await StoreReview.requestReview();
    
    // Mark as requested
    mmkvStorage.setBoolean(REVIEW_KEYS.HAS_REQUESTED_REVIEW, true);
    mmkvStorage.setString(REVIEW_KEYS.REVIEW_REQUEST_DATE, new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('Error requesting review:', error);
    return false;
  }
};

/**
 * Track completed events and request review after first successful event
 */
export const trackEventCompletedForReview = async (): Promise<void> => {
  const count = mmkvStorage.getNumber(REVIEW_KEYS.COMPLETED_EVENTS_COUNT) || 0;
  const newCount = count + 1;
  mmkvStorage.setNumber(REVIEW_KEYS.COMPLETED_EVENTS_COUNT, newCount);
  
  // Request review after first completed event (with sales logged)
  if (newCount === 1) {
    // Small delay to let the user see their success first
    setTimeout(() => {
      requestReviewIfAppropriate();
    }, 2000);
  }
};

/**
 * Check if we should show the review prompt
 */
export const shouldRequestReview = (): boolean => {
  const hasRequested = mmkvStorage.getBoolean(REVIEW_KEYS.HAS_REQUESTED_REVIEW);
  return !hasRequested;
};

/**
 * Reset review state (for testing)
 */
export const resetReviewState = (): void => {
  mmkvStorage.delete(REVIEW_KEYS.HAS_REQUESTED_REVIEW);
  mmkvStorage.delete(REVIEW_KEYS.REVIEW_REQUEST_DATE);
  mmkvStorage.delete(REVIEW_KEYS.COMPLETED_EVENTS_COUNT);
};

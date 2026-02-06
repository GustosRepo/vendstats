import { useState, useCallback, useMemo } from 'react';
import { getAllEvents, getAllSales, getSalesByEventId } from '../storage';
import { calculateEventStats, calculateGlobalStats } from '../utils/calculations';
import { EventStats, GlobalStats, Event, Sale } from '../types';

/**
 * Hook for event statistics
 */
export const useEventStats = (eventId: string) => {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(() => {
    setLoading(true);
    const events = getAllEvents();
    const event = events.find(e => e.id === eventId);
    
    if (event) {
      const sales = getSalesByEventId(eventId);
      const eventStats = calculateEventStats(event, sales);
      setStats(eventStats);
    }
    
    setLoading(false);
  }, [eventId]);

  return {
    stats,
    loading,
    loadStats,
  };
};

/**
 * Hook for global statistics
 */
export const useGlobalStats = () => {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(() => {
    setLoading(true);
    const events = getAllEvents();
    const sales = getAllSales();
    
    if (events.length > 0) {
      const globalStats = calculateGlobalStats(events, sales);
      setStats(globalStats);
    }
    
    setLoading(false);
  }, []);

  return {
    stats,
    loading,
    loadStats,
    hasData: stats !== null,
  };
};

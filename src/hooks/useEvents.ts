import { useState, useCallback, useEffect } from 'react';
import { 
  getAllEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  getEventsSortedByDate,
  getEventsCount,
} from '../storage';
import { Event, CreateEventInput, UpdateEventInput } from '../types';

/**
 * Hook for managing events
 */
export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(() => {
    setLoading(true);
    const allEvents = getEventsSortedByDate();
    setEvents(allEvents);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const addEvent = useCallback((input: CreateEventInput) => {
    const event = createEvent(input);
    loadEvents();
    return event;
  }, [loadEvents]);

  const editEvent = useCallback((input: UpdateEventInput) => {
    const event = updateEvent(input);
    loadEvents();
    return event;
  }, [loadEvents]);

  const removeEvent = useCallback((id: string) => {
    const success = deleteEvent(id);
    loadEvents();
    return success;
  }, [loadEvents]);

  const getEvent = useCallback((id: string) => {
    return getEventById(id);
  }, []);

  return {
    events,
    loading,
    loadEvents,
    addEvent,
    editEvent,
    removeEvent,
    getEvent,
    eventsCount: events.length,
  };
};

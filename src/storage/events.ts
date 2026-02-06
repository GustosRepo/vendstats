import { v4 as uuidv4 } from 'uuid';
import { mmkvStorage } from './mmkv';
import { Event, CreateEventInput, UpdateEventInput, STORAGE_KEYS } from '../types';

// Get all events
export const getAllEvents = (): Event[] => {
  const events = mmkvStorage.getJSON<Event[]>(STORAGE_KEYS.EVENTS);
  return events || [];
};

// Get single event by ID
export const getEventById = (id: string): Event | null => {
  const events = getAllEvents();
  return events.find(event => event.id === id) || null;
};

// Create new event
export const createEvent = (input: CreateEventInput): Event => {
  const events = getAllEvents();
  const now = new Date().toISOString();

  const newEvent: Event = {
    id: uuidv4(),
    name: input.name,
    date: input.date,
    boothFee: input.boothFee,
    travelCost: input.travelCost,
    notes: input.notes || '',
    createdAt: now,
    updatedAt: now,
  };

  events.push(newEvent);
  mmkvStorage.setJSON(STORAGE_KEYS.EVENTS, events);

  // Mark that first event has been created (for paywall trigger)
  if (events.length === 1) {
    mmkvStorage.setBoolean(STORAGE_KEYS.FIRST_EVENT_CREATED, true);
  }

  return newEvent;
};

// Update existing event
export const updateEvent = (input: UpdateEventInput): Event | null => {
  const events = getAllEvents();
  const index = events.findIndex(event => event.id === input.id);

  if (index === -1) {
    return null;
  }

  const updatedEvent: Event = {
    ...events[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  events[index] = updatedEvent;
  mmkvStorage.setJSON(STORAGE_KEYS.EVENTS, events);

  return updatedEvent;
};

// Delete event
export const deleteEvent = (id: string): boolean => {
  const events = getAllEvents();
  const filteredEvents = events.filter(event => event.id !== id);

  if (filteredEvents.length === events.length) {
    return false;
  }

  mmkvStorage.setJSON(STORAGE_KEYS.EVENTS, filteredEvents);
  return true;
};

// Get events count
export const getEventsCount = (): number => {
  return getAllEvents().length;
};

// Check if first event was created
export const hasCreatedFirstEvent = (): boolean => {
  return mmkvStorage.getBoolean(STORAGE_KEYS.FIRST_EVENT_CREATED) || false;
};

// Get events sorted by date (newest first)
export const getEventsSortedByDate = (): Event[] => {
  const events = getAllEvents();
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

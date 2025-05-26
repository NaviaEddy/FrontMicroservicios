import React, { useEffect, useState, createContext, useContext } from 'react';
// Types
export type Event = {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  capacity: number;
  ticketPrice: number;
  imageUrl: string;
  ticketsSold: number;
};
type EventContextType = {
  events: Event[];
  getEvent: (id: string) => Event | undefined;
  createEvent: (event: Omit<Event, 'id' | 'ticketsSold'>) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<Event | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
};
// Create context
const EventContext = createContext<EventContextType | undefined>(undefined);
// Provider component
export const EventProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Initialize events from localStorage or with sample data
  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    } else {
      // Sample events
      const sampleEvents: Event[] = [{
        id: '1',
        name: 'Summer Music Festival',
        date: '2023-07-15T18:00:00',
        location: 'Central Park, New York',
        description: 'Join us for a day of amazing music performances featuring top artists from around the world.',
        capacity: 5000,
        ticketPrice: 75.0,
        imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        ticketsSold: 2150
      }, {
        id: '2',
        name: 'Tech Conference 2023',
        date: '2023-09-22T09:00:00',
        location: 'Convention Center, San Francisco',
        description: 'The biggest tech conference of the year featuring keynotes, workshops, and networking opportunities.',
        capacity: 2000,
        ticketPrice: 299.0,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        ticketsSold: 1200
      }, {
        id: '3',
        name: 'Comedy Night',
        date: '2023-06-30T20:00:00',
        location: 'Laugh Factory, Los Angeles',
        description: 'A night of laughter with top comedians performing their best stand-up routines.',
        capacity: 500,
        ticketPrice: 45.0,
        imageUrl: 'https://images.unsplash.com/photo-1610964199131-5e29387e6267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        ticketsSold: 350
      }];
      setEvents(sampleEvents);
      localStorage.setItem('events', JSON.stringify(sampleEvents));
    }
    setIsLoading(false);
  }, []);
  // Get event by ID
  const getEvent = (id: string) => {
    return events.find(event => event.id === id);
  };
  // Create event
  const createEvent = async (eventData: Omit<Event, 'id' | 'ticketsSold'>): Promise<Event> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newEvent: Event = {
        ...eventData,
        id: `event-${Date.now()}`,
        ticketsSold: 0
      };
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      localStorage.setItem('events', JSON.stringify(updatedEvents));
      return newEvent;
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  // Update event
  const updateEvent = async (id: string, eventData: Partial<Event>): Promise<Event | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const eventIndex = events.findIndex(e => e.id === id);
      if (eventIndex === -1) {
        throw new Error('Event not found');
      }
      const updatedEvent = {
        ...events[eventIndex],
        ...eventData
      };
      const updatedEvents = [...events];
      updatedEvents[eventIndex] = updatedEvent;
      setEvents(updatedEvents);
      localStorage.setItem('events', JSON.stringify(updatedEvents));
      return updatedEvent;
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  // Delete event
  const deleteEvent = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedEvents = events.filter(e => e.id !== id);
      if (updatedEvents.length === events.length) {
        throw new Error('Event not found');
      }
      setEvents(updatedEvents);
      localStorage.setItem('events', JSON.stringify(updatedEvents));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return <EventContext.Provider value={{
    events,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    isLoading,
    error
  }}>
      {children}
    </EventContext.Provider>;
};
// Custom hook
export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
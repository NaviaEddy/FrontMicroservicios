import React, { useEffect, useState, createContext, useContext } from 'react';

// Types matching backend schema (ignoring created_at and updated_at)
export type Event = {
  id: number;
  nombre: string;
  fecha: string;        // ISO string
  lugar: string;
  capacidad: number;
  precio: number;
};

// Context type
type EventContextType = {
  events: Event[];
  getEvent: (id: number) => Promise<Event | null>;
  createEvent: (event: Omit<Event, 'id'>) => Promise<Event>;
  updateEvent: (id: number, event: Partial<Omit<Event, 'id'>>) => Promise<Event | null>;
  deleteEvent: (id: number) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
};

// Create context
const EventContext = createContext<EventContextType | undefined>(undefined);

// Provider component
export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'http://localhost/api/eventos';

  // Helper to get auth headers
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/`, {
          headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error(`Error fetching events: ${res.status}`);
        const data = await res.json();
        // Map response to Event[]
        const parsed: Event[] = (data as unknown[]).map((e) => {
          const eventObj = e as {
            id: number;
            nombre: string;
            fecha: string;
            lugar: string;
            capacidad: number;
            precio: number | string;
          };
          return {
            id: eventObj.id,
            nombre: eventObj.nombre,
            fecha: eventObj.fecha,
            lugar: eventObj.lugar,
            capacidad: eventObj.capacidad,
            precio: parseFloat(eventObj.precio as string)
          };
        });
        setEvents(parsed);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Get event by ID
  const getEvent = async (id: number): Promise<Event | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}/`, { 
        headers: getAuthHeaders() 
      });
      if (!res.ok) throw new Error(`Error fetching event ${id}: ${res.status}`);
      const e = await res.json();
      const evt: Event = {
        id: e.id,
        nombre: e.nombre,
        fecha: e.fecha,
        lugar: e.lugar,
        capacidad: e.capacidad,
        precio: parseFloat(e.precio)
      };
      // Optionally update list cache
      setEvents(prev => {
        const exists = prev.some(x => x.id === id);
        return exists ? prev.map(x => x.id === id ? evt : x) : [...prev, evt];
      });
      return evt;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create event
  const createEvent = async (eventData: Omit<Event, 'id'>): Promise<Event> => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        nombre: eventData.nombre,
        fecha: eventData.fecha,
        lugar: eventData.lugar,
        capacidad: eventData.capacidad,
        precio: eventData.precio
      };
      const res = await fetch(`${API_BASE}/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.status !== 201) throw new Error(`Failed to create event: ${res.status}`);
      const created = await res.json();
      const newEvent: Event = {
        id: created.id,
        nombre: created.nombre,
        fecha: created.fecha,
        lugar: created.lugar,
        capacidad: created.capacidad,
        precio: parseFloat(created.precio)
      };
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError('An unknown error occurred');
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update event
  const updateEvent = async (
    id: number,
    eventData: Partial<Omit<Event, 'id'>>
  ): Promise<Event | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const payload: Partial<Omit<Event, 'id'>> = { ...eventData };
      const res = await fetch(`${API_BASE}/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Failed to update event: ${res.status}`);
      const updated = await res.json();
      const updatedEvent: Event = {
        id: updated.id,
        nombre: updated.nombre,
        fecha: updated.fecha,
        lugar: updated.lugar,
        capacidad: updated.capacidad,
        precio: parseFloat(updated.precio)
      };
      setEvents(prev => prev.map(e => (e.id === id ? updatedEvent : e)));
      return updatedEvent;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete event
  const deleteEvent = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.status !== 204) throw new Error(`Failed to delete event: ${res.status}`);
      setEvents(prev => prev.filter(e => e.id !== id));
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EventContext.Provider value={{
      events,
      getEvent,
      createEvent,
      updateEvent,
      deleteEvent,
      isLoading,
      error
    }}>
      {children}
    </EventContext.Provider>
  );
};

// Custom hook
export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEvents must be used within an EventProvider');
  return context;
};

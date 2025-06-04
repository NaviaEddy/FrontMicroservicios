import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEvents, Event } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { CalendarIcon, MapPinIcon, ClockIcon, TicketIcon } from 'lucide-react';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEvent, isLoading: loading } = useEvents();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let canceled = false;
    const fetchEvent = async () => {
      setLoadingEvent(true);
      setError(null);
      try {
        const evt = await getEvent(Number(id));
        if (!canceled) setEvent(evt || null);
      } catch (e: unknown) {
        let message = 'Ocurrió un error';
        if (e instanceof Error) {
          message = e.message;
        }
        if (!canceled) setError(message);
      } finally {
        if (!canceled) setLoadingEvent(false);
      }
    };
    fetchEvent();
    return () => { canceled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loadingEvent || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{error || 'Evento no encontrado'}</h2>
        <Link to="/events" className="inline-block mt-4 text-indigo-600 hover:underline">Volver a eventos</Link>
      </div>
    );
  }

  const date = new Date(event.fecha);
  const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const isSoldOut = event.capacidad <= 0;

  return (
    <section className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{event.nombre}</h1>

      {/* Date, Time & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-gray-700">{formattedDate}</span>
        </div>
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-gray-700">{formattedTime}</span>
        </div>
        <div className="flex items-center">
          <MapPinIcon className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-gray-700">{event.lugar}</span>
        </div>
      </div>

      {/* Ticket Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-6 rounded-lg mb-8">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm text-gray-600">Precio</p>
          <p className="text-2xl font-bold text-indigo-600">${event.precio.toFixed(2)}</p>
        </div>
        <button
          onClick={() => user ? navigate(`/purchase/${event.id}`) : navigate('/login')}
          disabled={isSoldOut}
          className={`mt-2 sm:mt-0 inline-flex items-center px-5 py-2 rounded-md text-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
            ${isSoldOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          <TicketIcon className="h-5 w-5 mr-2" />
          {user ? 'Comprar entradas' : 'Inicia sesión para comprar'}
        </button>
      </div>

      {/* Back Link */}
      <div>
        <Link to="/events" className="text-indigo-600 hover:underline">&larr; Volver a eventos</Link>
      </div>
    </section>
  );
};

export default EventDetails;

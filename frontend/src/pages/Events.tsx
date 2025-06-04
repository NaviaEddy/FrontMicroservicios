import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents, Event } from '../context/EventContext';
import { usePurchases } from '../context/PurchaseContext';
import { CalendarIcon, MapPinIcon, SearchIcon, FilterIcon } from 'lucide-react';

const Events: React.FC = () => {
  const { events, isLoading, error } = useEvents();
  const { userPurchases } = usePurchases();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');

  // 1) Filtrar solo eventos cuyo campo “fecha” sea >= hoy
  const today = new Date();
  const futureEvents: Event[] = events.filter(evt => {
    const eventDate = new Date(evt.fecha);
    return eventDate >= today;
  });

  // 2) De esos futuros, filtrar por searchTerm en nombre o lugar
  const filteredEvents = futureEvents.filter(evt =>
    evt.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evt.lugar.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3) Ordenar según sortBy
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    } else {
      return a.precio - b.precio;
    }
  });

  // 4) Construir conjunto de IDs de eventos ya comprados por el usuario
  const purchasedEventIds = new Set(
    userPurchases.map(purchase => Number(purchase.eventId))
  );

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Eventos próximos
        </h1>
        <p className="text-gray-600">
          Descubre y reserva entradas para los mejores eventos.
        </p>
      </div>

      {/* Search & Sort */}
      <div className="flex mb-6 space-x-4">
        <div className="flex items-center border rounded-lg px-3 py-2 w-full">
          <SearchIcon className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full focus:outline-none"
          />
        </div>
        <button
          className="flex items-center border rounded-lg px-3 py-2"
          onClick={() => setSortBy(sortBy === 'date' ? 'price' : 'date')}
        >
          <FilterIcon className="h-5 w-5 text-gray-500 mr-2" />
          {sortBy === 'date' ? 'Ordenar por precio' : 'Ordenar por fecha'}
        </button>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">
          Ocurrió un error al cargar los eventos: {error}
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">
            No se encontraron eventos que coincidan con tu búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map(event => {
            const alreadyPurchased = purchasedEventIds.has(event.id);

            return (
              <div
                key={event.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {event.nombre}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {new Date(event.fecha).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">{event.lugar}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-indigo-600 font-bold">
                      S/ {event.precio.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Capacidad: {event.capacidad}
                    </span>
                  </div>

                  {/* Botón de compra o etiqueta de comprado */}
                  {alreadyPurchased ? (
                    <span className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                      ✔ Compraste este evento
                    </span>
                  ) : (
                    <Link
                      to={`/purchase/${event.id}`}
                      className="inline-block w-full text-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
                    >
                      Comprar Entradas
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;

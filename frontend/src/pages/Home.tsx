import React from 'react';
import { Link } from 'react-router-dom';
import { useEvents, Event } from '../context/EventContext';
import { usePurchases } from '../context/PurchaseContext';
import { CalendarIcon, MapPinIcon, TicketIcon } from 'lucide-react';

const Home: React.FC = () => {
  const { events, isLoading, error } = useEvents();
  const { userPurchases } = usePurchases();

  // Conjunto de IDs de eventos ya comprados
  const purchasedEventIds = new Set(
    userPurchases.map((purchase) => Number(purchase.eventId))
  );

  // Si está cargando, mostramos un spinner grande
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Si hubo error al traer eventos, lo mostramos
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md max-w-lg mx-auto mt-8">
        Ocurrió un error al cargar los eventos: {error}
      </div>
    );
  }

  const now = new Date();
  const upcomingEvents: Event[] = events
    .filter((evt) => {
      const eventDate = new Date(evt.fecha);
      return eventDate > now;
    })
    .sort(
      (a, b) =>
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    )
    .slice(0, 3);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-indigo-700 text-white rounded-lg overflow-hidden shadow-xl mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Encuentra y Reserva Eventos Increíbles
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-indigo-100">
                Descubre conciertos, conferencias, espectáculos y más con nuestra plataforma de
                venta de entradas basada en microservicios.
              </p>
              <Link
                to="/events"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50"
              >
                Explorar Eventos
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <TicketIcon className="h-8 w-8 text-indigo-300" />
                  <h2 className="ml-2 text-xl font-bold">
                    Arquitectura de Microservicios Segura
                  </h2>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-300 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-800">✓</span>
                    </div>
                    <p className="ml-3 text-base">JWT Authentication & Authorization</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-300 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-800">✓</span>
                    </div>
                    <p className="ml-3 text-base">Procesamiento de Pagos Seguro</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-300 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-800">✓</span>
                    </div>
                    <p className="ml-3 text-base">
                      Notificaciones por Correo Electrónico en Tiempo Real
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Eventos próximos</h2>
          <Link to="/events" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Ver todos los eventos
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            No hay eventos próximos disponibles.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => {
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
                        {event.capacidad} disponibles
                      </span>
                    </div>

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
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Cómo funciona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Explorar Eventos</h3>
            <p className="text-gray-600">
              Descubre eventos próximos en tu área o por categoría.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <TicketIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Comprar Entradas</h3>
            <p className="text-gray-600">
              Pago seguro con nuestro sistema de pago protegido.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Recibir Notificaciones</h3>
            <p className="text-gray-600">
              Recibe confirmaciones por correo electrónico y actualizaciones de eventos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¿Listo para encontrar tu próximo evento?
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Únete a miles de personas que utilizan nuestra plataforma para descubrir y asistir a eventos increíbles.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/events"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Explorar Eventos
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50"
          >
            Registrarse
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

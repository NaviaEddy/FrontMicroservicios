import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { CalendarIcon, MapPinIcon, UserIcon, ClockIcon, TicketIcon } from 'lucide-react';
const EventDetails: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    getEvent,
    isLoading
  } = useEvents();
  const {
    user
  } = useAuth();
  const event = id ? getEvent(id) : undefined;
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>;
  }
  if (!event) {
    return <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Event not found
        </h2>
        <p className="text-gray-600 mb-6">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/events" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Browse all events
        </Link>
      </div>;
  }
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const ticketsRemaining = event.capacity - event.ticketsSold;
  const isSoldOut = ticketsRemaining <= 0;
  return <div className="w-full">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg">
        <div className="h-64 md:h-96 overflow-hidden">
          <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {event.name}
              </h1>
              <div className="flex items-center text-gray-600 mb-3">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <UserIcon className="h-5 w-5 mr-2" />
                <span>{event.ticketsSold} attending</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg md:w-64">
              <div className="mb-4">
                <div className="text-gray-600 mb-1">Ticket Price</div>
                <div className="text-2xl font-bold text-indigo-600">
                  ${event.ticketPrice.toFixed(2)}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-gray-600 mb-1">Availability</div>
                <div className={`font-medium ${isSoldOut ? 'text-red-600' : 'text-green-600'}`}>
                  {isSoldOut ? 'Sold Out' : `${ticketsRemaining} tickets remaining`}
                </div>
              </div>
              <button onClick={() => user ? navigate(`/purchase/${event.id}`) : navigate('/login')} disabled={isSoldOut} className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${isSoldOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}>
                <TicketIcon className="h-5 w-5 mr-2" />
                {user ? 'Buy Tickets' : 'Sign in to Buy'}
              </button>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              About this event
            </h2>
            <p className="text-gray-600 whitespace-pre-line">
              {event.description}
            </p>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Venue Information
            </h2>
            <p className="text-gray-600 mb-4">{event.location}</p>
            {/* We could add a map here in a real application */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-500">
                  Venue map would be displayed here
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default EventDetails;
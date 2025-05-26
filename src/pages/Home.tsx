import React from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { CalendarIcon, MapPinIcon, TicketIcon } from 'lucide-react';
const Home: React.FC = () => {
  const {
    events,
    isLoading
  } = useEvents();
  // Get upcoming events (limit to 3)
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
  return <div className="w-full">
      {/* Hero Section */}
      <div className="bg-indigo-700 text-white rounded-lg overflow-hidden shadow-xl mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Find and Book Amazing Events
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-indigo-100">
                Discover concerts, conferences, shows and more with our secure
                microservices-based ticket platform.
              </p>
              <Link to="/events" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50">
                Browse Events
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <TicketIcon className="h-8 w-8 text-indigo-300" />
                  <h2 className="ml-2 text-xl font-bold">
                    Secure Microservices Architecture
                  </h2>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-300 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-800">
                        ✓
                      </span>
                    </div>
                    <p className="ml-3 text-base">
                      JWT Authentication & Authorization
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-300 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-800">
                        ✓
                      </span>
                    </div>
                    <p className="ml-3 text-base">Secure Payment Processing</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-300 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-800">
                        ✓
                      </span>
                    </div>
                    <p className="ml-3 text-base">
                      Real-time Email Notifications
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
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          <Link to="/events" className="text-indigo-600 hover:text-indigo-800 font-medium">
            View all events
          </Link>
        </div>
        {isLoading ? <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => <Link key={event.id} to={`/events/${event.id}`} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 overflow-hidden">
                  <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {event.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {new Date(event.date).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-600 font-bold">
                      ${event.ticketPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {event.capacity - event.ticketsSold} tickets left
                    </span>
                  </div>
                </div>
              </Link>)}
          </div>}
      </section>
      {/* How It Works Section */}
      <section className="bg-gray-50 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Browse Events</h3>
            <p className="text-gray-600">
              Discover upcoming events in your area or by category.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <TicketIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Purchase Tickets</h3>
            <p className="text-gray-600">
              Secure checkout with our protected payment system.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Get Notified</h3>
            <p className="text-gray-600">
              Receive email confirmations and event updates.
            </p>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="bg-indigo-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to find your next event?
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of people who use our platform to discover and attend
          amazing events.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/events" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Browse Events
          </Link>
          <Link to="/register" className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50">
            Sign Up
          </Link>
        </div>
      </section>
    </div>;
};
export default Home;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { CalendarIcon, MapPinIcon, SearchIcon, FilterIcon } from 'lucide-react';
const Events: React.FC = () => {
  const {
    events,
    isLoading
  } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  // Filter events based on search term
  const filteredEvents = events.filter(event => event.name.toLowerCase().includes(searchTerm.toLowerCase()) || event.location.toLowerCase().includes(searchTerm.toLowerCase()));
  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      return a.ticketPrice - b.ticketPrice;
    }
  });
  return <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Upcoming Events
        </h1>
        <p className="text-gray-600">
          Discover and book tickets for the best events.
        </p>
      </div>
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" placeholder="Search events by name or location" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="md:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FilterIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'price')} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="date">Sort by date</option>
                <option value="price">Sort by price</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Events List */}
      {isLoading ? <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div> : sortedEvents.length === 0 ? <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">
            No events found matching your search.
          </p>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map(event => <Link key={event.id} to={`/events/${event.id}`} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
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
    </div>;
};
export default Events;
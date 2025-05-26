import React, { useState } from 'react';
import { useEvents } from '../context/EventContext';
import { CalendarIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon } from 'lucide-react';
type EventFormData = {
  name: string;
  date: string;
  location: string;
  description: string;
  capacity: number;
  ticketPrice: number;
  imageUrl: string;
};
const AdminDashboard: React.FC = () => {
  const {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    isLoading,
    error
  } = useEvents();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    date: '',
    location: '',
    description: '',
    capacity: 100,
    ticketPrice: 0,
    imageUrl: ''
  });
  const [formError, setFormError] = useState('');
  // Reset form and state
  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      location: '',
      description: '',
      capacity: 100,
      ticketPrice: 0,
      imageUrl: ''
    });
    setFormError('');
  };
  // Handle opening the edit form
  const handleEditClick = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      // Format date string for datetime-local input
      const dateObj = new Date(event.date);
      const formattedDate = dateObj.toISOString().slice(0, 16);
      setFormData({
        name: event.name,
        date: formattedDate,
        location: event.location,
        description: event.description,
        capacity: event.capacity,
        ticketPrice: event.ticketPrice,
        imageUrl: event.imageUrl
      });
      setIsEditing(eventId);
      setIsCreating(false);
    }
  };
  // Handle opening the create form
  const handleCreateClick = () => {
    resetForm();
    setIsCreating(true);
    setIsEditing(null);
  };
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value,
      type
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };
  // Validate form data
  const validateForm = () => {
    if (!formData.name) return 'Event name is required';
    if (!formData.date) return 'Event date is required';
    if (!formData.location) return 'Event location is required';
    if (!formData.description) return 'Event description is required';
    if (formData.capacity <= 0) return 'Capacity must be greater than 0';
    if (formData.ticketPrice < 0) return 'Ticket price cannot be negative';
    if (!formData.imageUrl) return 'Image URL is required';
    return null;
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    try {
      if (isCreating) {
        await createEvent(formData);
        setIsCreating(false);
      } else if (isEditing) {
        await updateEvent(isEditing, formData);
        setIsEditing(null);
      }
      resetForm();
    } catch (err) {
      // Error is handled by the context
    }
  };
  // Handle event deletion
  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(eventId);
    }
  };
  // Render the event form (create or edit)
  const renderEventForm = () => <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">
        {isCreating ? 'Create New Event' : 'Edit Event'}
      </h2>
      {(error || formError) && <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {formError || error}
        </div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Event Name
          </label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date and Time
          </label>
          <input type="datetime-local" id="date" name="date" value={formData.date} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <input type="number" id="capacity" name="capacity" min="1" value={formData.capacity} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Ticket Price ($)
            </label>
            <input type="number" id="ticketPrice" name="ticketPrice" min="0" step="0.01" value={formData.ticketPrice} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input type="text" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={() => {
          setIsCreating(false);
          setIsEditing(null);
        }} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
            {isLoading ? 'Saving...' : isCreating ? 'Create Event' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>;
  return <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        {!isCreating && !isEditing && <button onClick={handleCreateClick} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Event
          </button>}
      </div>
      {(isCreating || isEditing) && renderEventForm()}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Manage Events</h2>
          <p className="mt-1 text-sm text-gray-500">
            View, edit, and delete events from the system.
          </p>
        </div>
        {isLoading && !isCreating && !isEditing ? <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div> : events.length === 0 ? <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found.</p>
            <button onClick={handleCreateClick} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create your first event
            </button>
          </div> : <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map(event => <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={event.imageUrl} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {event.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {event.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <div className="text-sm text-gray-900">
                          {new Date(event.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {event.ticketsSold} / {event.capacity}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2.5 mt-1">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{
                    width: `${event.ticketsSold / event.capacity * 100}%`
                  }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${event.ticketPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => window.open(`/events/${event.id}`, '_blank')} className="text-indigo-600 hover:text-indigo-900">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleEditClick(event.id)} className="text-blue-600 hover:text-blue-900">
                          <EditIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>}
      </div>
    </div>;
};
export default AdminDashboard;
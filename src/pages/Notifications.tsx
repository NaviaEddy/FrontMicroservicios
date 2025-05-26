import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { BellIcon, CheckIcon, TrashIcon } from 'lucide-react';
const Notifications: React.FC = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
    error
  } = useNotifications();
  const navigate = useNavigate();
  const handleNotificationClick = async (notification: {
    id: string;
    eventId?: string;
    purchaseId?: string;
  }, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notification.id);
    }
    if (notification.eventId) {
      navigate(`/events/${notification.eventId}`);
    }
  };
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>;
  }
  return <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BellIcon className="h-6 w-6 text-indigo-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                Notifications
              </h1>
            </div>
            {notifications.length > 0 && <button onClick={() => markAllAsRead()} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Mark all as read
              </button>}
          </div>
        </div>
        {error && <div className="p-4 bg-red-50 text-red-700">{error}</div>}
        {notifications.length === 0 ? <div className="p-12 text-center">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No notifications
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any notifications at the moment.
            </p>
          </div> : <div className="divide-y divide-gray-200">
            {notifications.map(notification => <div key={notification.id} className={`p-4 sm:p-6 ${notification.isRead ? 'bg-white' : 'bg-indigo-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => handleNotificationClick(notification, notification.isRead)}>
                    <h3 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
                    {!notification.isRead && <button onClick={() => markAsRead(notification.id)} className="text-indigo-600 hover:text-indigo-800" title="Mark as read">
                        <CheckIcon className="h-5 w-5" />
                      </button>}
                    <button onClick={() => deleteNotification(notification.id)} className="text-gray-400 hover:text-red-600" title="Delete notification">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>)}
          </div>}
      </div>
    </div>;
};
export default Notifications;
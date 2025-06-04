import React, { useEffect, useState, createContext, useContext } from 'react';
// Types
export type Notification = {
  id: string;
  userId: string;
  type: 'purchase_confirmation' | 'event_update' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  eventId?: string;
  purchaseId?: string;
};
type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  sendNotification: (notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => Promise<Notification>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
};
// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
// Provider component
export const NotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Initialize notifications from localStorage
  useEffect(() => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
    setIsLoading(false);
  }, []);
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;
  // Send a new notification
  const sendNotification = async (notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newNotification: Notification = {
        ...notificationData,
        id: `notification-${Date.now()}`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      const updatedNotifications = [newNotification, ...notifications];
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      // Simulate sending an email
      console.log('Email sent:', {
        to: notificationData.userId,
        subject: notificationData.title,
        body: notificationData.message
      });
      return newNotification;
    } catch (err: any) {
      setError(err.message || 'Failed to send notification');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  // Mark a notification as read
  const markAsRead = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      const notificationIndex = notifications.findIndex(n => n.id === id);
      if (notificationIndex === -1) {
        throw new Error('Notification not found');
      }
      const updatedNotification: Notification = {
        ...notifications[notificationIndex],
        isRead: true
      };
      const updatedNotifications = [...notifications];
      updatedNotifications[notificationIndex] = updatedNotification;
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  // Mark all notifications as read
  const markAllAsRead = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      const updatedNotifications = notifications.map(n => ({
        ...n,
        isRead: true
      }));
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  // Delete a notification
  const deleteNotification = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      const updatedNotifications = notifications.filter(n => n.id !== id);
      if (updatedNotifications.length === notifications.length) {
        throw new Error('Notification not found');
      }
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return <NotificationContext.Provider value={{
    notifications,
    unreadCount,
    sendNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
    error
  }}>
      {children}
    </NotificationContext.Provider>;
};
// Custom hook
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
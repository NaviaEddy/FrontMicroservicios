import React, { useEffect, useState, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useEvents, Event } from './EventContext';
import { useNotifications } from './NotificationContext';
// Types
export type Purchase = {
  id: string;
  eventId: string;
  userId: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentId?: string;
};
type PurchaseContextType = {
  purchases: Purchase[];
  userPurchases: Purchase[];
  createPurchase: (eventId: string, quantity: number) => Promise<Purchase>;
  processPurchase: (purchaseId: string, paymentDetails: any) => Promise<Purchase | null>;
  cancelPurchase: (purchaseId: string) => Promise<boolean>;
  getPurchase: (id: string) => Purchase | undefined;
  isLoading: boolean;
  error: string | null;
};
// Create context
const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);
// Provider component
export const PurchaseProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    user
  } = useAuth();
  const {
    getEvent,
    updateEvent
  } = useEvents();
  const {
    sendNotification
  } = useNotifications();
  // Initialize purchases from localStorage
  useEffect(() => {
    const storedPurchases = localStorage.getItem('purchases');
    if (storedPurchases) {
      setPurchases(JSON.parse(storedPurchases));
    }
    setIsLoading(false);
  }, []);
  // Filter purchases for current user
  const userPurchases = user ? purchases.filter(p => p.userId === user.id) : [];
  // Get purchase by ID
  const getPurchase = (id: string) => {
    return purchases.find(purchase => purchase.id === id);
  };
  // Create a new purchase (reserve tickets)
  const createPurchase = async (eventId: string, quantity: number): Promise<Purchase> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) {
        throw new Error('User must be logged in to purchase tickets');
      }
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const event = getEvent(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      if (event.ticketsSold + quantity > event.capacity) {
        throw new Error('Not enough tickets available');
      }
      const newPurchase: Purchase = {
        id: `purchase-${Date.now()}`,
        eventId,
        userId: user.id,
        quantity,
        totalPrice: event.ticketPrice * quantity,
        purchaseDate: new Date().toISOString(),
        status: 'pending'
      };
      const updatedPurchases = [...purchases, newPurchase];
      setPurchases(updatedPurchases);
      localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
      return newPurchase;
    } catch (err: any) {
      setError(err.message || 'Failed to create purchase');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  // Process payment and complete purchase
  const processPurchase = async (purchaseId: string, paymentDetails: any): Promise<Purchase | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const purchaseIndex = purchases.findIndex(p => p.id === purchaseId);
      if (purchaseIndex === -1) {
        throw new Error('Purchase not found');
      }
      const purchase = purchases[purchaseIndex];
      const event = getEvent(purchase.eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      // Simulate payment processing
      const paymentId = `pay-${Date.now()}`;
      // Update purchase status
      const updatedPurchase: Purchase = {
        ...purchase,
        status: 'completed',
        paymentId
      };
      const updatedPurchases = [...purchases];
      updatedPurchases[purchaseIndex] = updatedPurchase;
      setPurchases(updatedPurchases);
      localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
      // Update event ticket count
      await updateEvent(event.id, {
        ticketsSold: event.ticketsSold + purchase.quantity
      });
      // Send notification
      if (user) {
        sendNotification({
          userId: user.id,
          type: 'purchase_confirmation',
          title: 'Purchase Confirmed',
          message: `Your purchase of ${purchase.quantity} ticket(s) for ${event.name} has been confirmed.`,
          eventId: event.id,
          purchaseId: purchase.id
        });
      }
      return updatedPurchase;
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  // Cancel a purchase
  const cancelPurchase = async (purchaseId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const purchaseIndex = purchases.findIndex(p => p.id === purchaseId);
      if (purchaseIndex === -1) {
        throw new Error('Purchase not found');
      }
      const purchase = purchases[purchaseIndex];
      if (purchase.status === 'completed') {
        throw new Error('Cannot cancel a completed purchase');
      }
      const updatedPurchase: Purchase = {
        ...purchase,
        status: 'cancelled'
      };
      const updatedPurchases = [...purchases];
      updatedPurchases[purchaseIndex] = updatedPurchase;
      setPurchases(updatedPurchases);
      localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel purchase');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return <PurchaseContext.Provider value={{
    purchases,
    userPurchases,
    createPurchase,
    processPurchase,
    cancelPurchase,
    getPurchase,
    isLoading,
    error
  }}>
      {children}
    </PurchaseContext.Provider>;
};
// Custom hook
export const usePurchases = () => {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error('usePurchases must be used within a PurchaseProvider');
  }
  return context;
};
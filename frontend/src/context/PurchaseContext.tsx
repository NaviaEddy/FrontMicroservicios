import React, { useEffect, useState, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useEvents } from './EventContext';
import { useNotifications } from './NotificationContext';

// --------------------------------------------------
// Tipos
// --------------------------------------------------
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
  createPurchase: (eventId: number, quantity: number) => Promise<Purchase>;
  processPurchase: (purchaseId: string) => Promise<Purchase | null>;
  cancelPurchase: (purchaseId: string) => Promise<boolean>;
  getPurchase: (id: string) => Purchase | undefined;
  isLoading: boolean;
  error: string | null;
};

// --------------------------------------------------
// Contexto
// --------------------------------------------------
const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { getEvent, updateEvent } = useEvents();
  const { sendNotification } = useNotifications();

  // Base URL de la API de compras
  const API_BASE = 'http://localhost/api/compras';

  // --------------------------------------------------
  // Helper para obtener headers de autenticación
  // --------------------------------------------------
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // --------------------------------------------------
  // Cargar compras desde localStorage al iniciar
  // --------------------------------------------------
  useEffect(() => {
    const stored = localStorage.getItem('purchases');
    if (stored) {
      setPurchases(JSON.parse(stored));
    }
  }, []);

  const userPurchases = user ? purchases.filter(p => p.userId === user.id) : [];

  const getPurchase = (id: string) => {
    return purchases.find(p => p.id === id);
  };

  // --------------------------------------------------
  // CREATE PURCHASE: crea una compra nueva (pagado = false)
  // --------------------------------------------------
  const createPurchase = async (eventId: number, quantity: number): Promise<Purchase> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) throw new Error('User must be logged in to purchase tickets');

      // 1) Obtener datos del evento para validar capacidad y precio
      const event = await getEvent(Number(eventId));
      if (!event) throw new Error('Event not found');

      // Verificar que no se soliciten más boletos que la capacidad total
      if (quantity > event.capacidad) {
        throw new Error('Not enough tickets available');
      }

      // 2) Llamada POST a la API para crear la compra
      const payload = {
        evento_id: Number(eventId),
        cantidad: quantity,
      };

      const response = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to create purchase: ${response.status} ${text}`);
      }

      const responseData = await response.json();
      // responseData tiene esta forma:
      // {
      //   "_id": { "$oid": "683f6f41fcc44337553f27c9" },
      //   "usuario_id": "1",
      //   "evento_id": 4,
      //   "cantidad": 2,
      //   "pagado": false,
      //   "fecha_compra": "2025-06-03T21:55:13.276745933+00:00"
      // }

      // 3) Calcular totalPrice con el precio del evento
      const totalPrice = event.precio * responseData.cantidad;

      // 4) Mapear al tipo interno Purchase
      const newPurchase: Purchase = {
        id: responseData._id.$oid,
        eventId: String(responseData.evento_id),
        userId: String(responseData.usuario_id),
        quantity: responseData.cantidad,
        totalPrice,
        purchaseDate: responseData.fecha_compra,
        status: responseData.pagado ? 'completed' : 'pending',
        // paymentId lo dejamos undefined, pues el endpoint de creación nunca lo asigna
      };

      // 5) Actualizar estado local y localStorage
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

  // --------------------------------------------------
  // PROCESS PURCHASE: “Pagar” la compra (PUT a /{id}/pagar)
  // --------------------------------------------------
  const processPurchase = async (purchaseId: string): Promise<Purchase | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1) Verificar que la compra exista localmente
      const index = purchases.findIndex(p => p.id === purchaseId);
      if (index === -1) throw new Error('Purchase not found');

      const existingPurchase = purchases[index];

      // 2) Realizar PUT a /api/compras/{purchaseId}/pagar
      const response = await fetch(`${API_BASE}/${purchaseId}/pagar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to process payment: ${response.status} ${text}`);
      }

      const responseData = await response.json();

      // 3) Obtener de nuevo el evento para retomar el precio y la capacidad actual
      const event = await getEvent(Number(responseData.evento_id));
      if (!event) throw new Error('Event not found');

      // Calcular totalPrice (lo mismo que en create)
      const totalPrice = event.precio * responseData.cantidad;

      // 4) Mapear a nuestro Purchase interno
      const updatedPurchase: Purchase = {
        id: responseData._id.$oid,
        eventId: String(responseData.evento_id),
        userId: String(responseData.usuario_id),
        quantity: responseData.cantidad,
        totalPrice,
        purchaseDate: responseData.fecha_compra,
        status: responseData.pagado ? 'completed' : 'pending',
        // paymentId sigue undefined (si tu API no devuelve payment_id, se omite)
      };

      // 5) Reemplazar la compra en el array local
      const updatedPurchases = [...purchases];
      updatedPurchases[index] = updatedPurchase;
      setPurchases(updatedPurchases);
      localStorage.setItem('purchases', JSON.stringify(updatedPurchases));

      // 6) Reducir capacidad del evento (si el backend no lo hace automáticamente)
      //    Aquí asumimos que debemos restar manualmente:
      await updateEvent(event.id, {
        capacidad: event.capacidad - updatedPurchase.quantity,
      });

      // 7) Notificar al usuario
      if (user) {
        await sendNotification({
          userId: user.id,
          type: 'purchase_confirmation',
          title: 'Tu compra se completó',
          message: `Has comprado ${updatedPurchase.quantity} boleto(s) para "${event.nombre}".`,
          eventId: event.id.toString(),
          purchaseId: updatedPurchase.id,
        });
      }

      return updatedPurchase;
    } catch (err: any) {
      setError(err.message || 'Failed to process purchase');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // CANCEL PURCHASE: marcar estado “cancelled” localmente
  // --------------------------------------------------
  const cancelPurchase = async (purchaseId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const index = purchases.findIndex(p => p.id === purchaseId);
      if (index === -1) throw new Error('Purchase not found');

      const purchase = purchases[index];
      if (purchase.status === 'completed') {
        throw new Error('Cannot cancel a completed purchase');
      }

      const updatedPurchase: Purchase = {
        ...purchase,
        status: 'cancelled',
      };

      const updatedPurchases = [...purchases];
      updatedPurchases[index] = updatedPurchase;
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

  return (
    <PurchaseContext.Provider
      value={{
        purchases,
        userPurchases,
        createPurchase,
        processPurchase,
        cancelPurchase,
        getPurchase,
        isLoading,
        error,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

// --------------------------------------------------
// Hook personalizado para consumir el contexto
// --------------------------------------------------
export const usePurchases = () => {
  const context = useContext(PurchaseContext);
  if (!context) throw new Error('usePurchases must be used within a PurchaseProvider');
  return context;
};

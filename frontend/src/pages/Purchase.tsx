import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, CreditCardIcon, CheckCircleIcon } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { usePurchases } from '../context/PurchaseContext';

// Definimos los pasos del flujo de compra
enum PurchaseStep {
  SELECT_TICKETS,
  PAYMENT,
  CONFIRMATION,
}

const Purchase: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { getEvent } = useEvents();
  const { createPurchase, processPurchase, isLoading, error } = usePurchases();

  // Estado local
  const [eventData, setEventData] = useState<ReturnType<typeof getEvent> extends Promise<infer R> ? R : null>(null);
  const [loadingEvent, setLoadingEvent] = useState<boolean>(true);

  const [quantity, setQuantity] = useState<number>(1);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>(PurchaseStep.SELECT_TICKETS);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [formError, setFormError] = useState<string>('');

  // 1) Cargar el evento al montar el componente (sólo cuando cambie `id`)
  useEffect(() => {
    if (!id) {
      navigate('/events');
      return;
    }

    (async () => {
      setLoadingEvent(true);
      try {
        const evt = await getEvent(Number(id));
        if (!evt) {
          // Si no existe, redirigir a lista de eventos
          navigate('/events');
          return;
        }
        setEventData(evt);
      } catch {
        navigate('/events');
      } finally {
        setLoadingEvent(false);
      }
    })();
    // << IMPORTANTE >>: aquí sólo ponemos `id` y `navigate` en dependencias,
    // sacamos `getEvent` para evitar bucles infinitos.
  }, [id, navigate]);

  // Si todavía estamos cargando el evento, mostramos un spinner
  if (loadingEvent) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Si por alguna razón no hay evento (aunque navegamos antes), no renderizamos nada
  if (!eventData) {
    return null;
  }

  // Cálculo del precio total
  const totalPrice = eventData.precio * quantity;

  // Handler para cambiar cantidad
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setQuantity(1);
    } else {
      // Asegurarse de que quede dentro de [1, capacidad]
      const clamped = Math.max(1, Math.min(val, eventData.capacidad));
      setQuantity(clamped);
    }
  };

  // Handler para inputs de pago
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Paso 1 -> 2: crear la compra en la API (status = 'pending')
  const handleContinueToPayment = async () => {
    try {
      if (!id) return;
      // createPurchase hace POST a /api/compras con { evento_id, cantidad }
      const purchase = await createPurchase(Number(id), quantity);
      setPurchaseId(purchase.id);
      setPurchaseStep(PurchaseStep.PAYMENT);
    } catch {
      // El error ya se maneja en el contexto (error || isLoading)
    }
  };

  // Paso 2 -> 3: “procesar” el pago y cambiar el status en la API a 'completed'
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validación sencilla
    if (
      !paymentDetails.cardNumber ||
      !paymentDetails.cardName ||
      !paymentDetails.expiryDate ||
      !paymentDetails.cvv
    ) {
      setFormError('Por favor completa todos los datos de la tarjeta.');
      return;
    }

    if (purchaseId) {
      const result = await processPurchase(purchaseId);
      if (result) {
        setPurchaseStep(PurchaseStep.CONFIRMATION);
      }
    }
  };

  // Render de la primera etapa: seleccionar cantidad
  const renderSelectTickets = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Seleccionar Boletos</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{eventData.nombre}</h3>
        <div className="flex items-center text-gray-600 mt-1">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {new Date(eventData.fecha).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="flex items-center text-gray-600 mt-1">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{eventData.lugar}</span>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Número de boletos
        </label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={handleQuantityChange}
          min={1}
          max={eventData.capacidad}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Máximo disponible: {eventData.capacidad} boletos
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Precio por boleto:</span>
          <span className="text-gray-900">S/ {eventData.precio.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Cantidad:</span>
          <span className="text-gray-900">{quantity}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>S/ {totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {(error || formError) && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {formError || error}
        </div>
      )}

      <div className="flex justify-between">
        <Link
          to={`/events/${id}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Regresar al evento
        </Link>
        <button
          onClick={handleContinueToPayment}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isLoading ? 'Procesando...' : 'Continuar al pago'}
        </button>
      </div>
    </div>
  );

  // Render de la segunda etapa: formulario de pago
  const renderPayment = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de Pago</h2>

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Evento:</span>
          <span className="text-gray-900">{eventData.nombre}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Fecha:</span>
          <span className="text-gray-900">
            {new Date(eventData.fecha).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Boletos:</span>
          <span className="text-gray-900">{quantity}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>S/ {totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {(error || formError) && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {formError || error}
        </div>
      )}

      <form onSubmit={handleProcessPayment} className="space-y-4">
        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre en la tarjeta
          </label>
          <input
            type="text"
            id="cardName"
            name="cardName"
            value={paymentDetails.cardName}
            onChange={handlePaymentChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Número de tarjeta
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={paymentDetails.cardNumber}
            onChange={handlePaymentChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="1234 5678 9012 3456"
          />
        </div>

        <div className="flex space-x-4">
          <div className="w-1/2">
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de expiración (MM/AA)
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={paymentDetails.expiryDate}
              onChange={handlePaymentChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="MM/AA"
              maxLength={5}
            />
          </div>
          <div className="w-1/2">
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={paymentDetails.cvv}
              onChange={handlePaymentChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="123"
              maxLength={4}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <button
            type="button"
            onClick={() => setPurchaseStep(PurchaseStep.SELECT_TICKETS)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Atrás
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            <CreditCardIcon className="h-5 w-5 mr-2" />
            {isLoading ? 'Procesando pago...' : 'Completar compra'}
          </button>
        </div>
      </form>
    </div>
  );

  // Render de la tercera etapa: confirmación
  const renderConfirmation = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircleIcon className="h-12 w-12 text-green-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Compra Confirmada!</h2>
      <p className="text-gray-600 mb-6">Gracias por tu compra. Se ha enviado una confirmación por correo.</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la compra</h3>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Evento:</span>
          <span className="text-gray-900">{eventData.nombre}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Fecha:</span>
          <span className="text-gray-900">
            {new Date(eventData.fecha).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Lugar:</span>
          <span className="text-gray-900">{eventData.lugar}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Cantidad de boletos:</span>
          <span className="text-gray-900">{quantity}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total pagado:</span>
          <span>S/ {totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Link
          to="/events"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Ver más eventos
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Indicador de pasos */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {/* Paso 1 */}
          <div className={`flex items-center ${purchaseStep >= PurchaseStep.SELECT_TICKETS ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full ${
                purchaseStep >= PurchaseStep.SELECT_TICKETS ? 'bg-indigo-100' : 'bg-gray-100'
              }`}
            >
              1
            </div>
            <span className="ml-2 text-sm font-medium">Seleccionar boletos</span>
          </div>
          <div className={`flex-grow border-t ${purchaseStep > PurchaseStep.SELECT_TICKETS ? 'border-indigo-600' : 'border-gray-200'} mx-4`} />

          {/* Paso 2 */}
          <div className={`flex items-center ${purchaseStep >= PurchaseStep.PAYMENT ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full ${
                purchaseStep >= PurchaseStep.PAYMENT ? 'bg-indigo-100' : 'bg-gray-100'
              }`}
            >
              2
            </div>
            <span className="ml-2 text-sm font-medium">Pago</span>
          </div>
          <div className={`flex-grow border-t ${purchaseStep > PurchaseStep.PAYMENT ? 'border-indigo-600' : 'border-gray-200'} mx-4`} />

          {/* Paso 3 */}
          <div className={`flex items-center ${purchaseStep >= PurchaseStep.CONFIRMATION ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full ${
                purchaseStep >= PurchaseStep.CONFIRMATION ? 'bg-indigo-100' : 'bg-gray-100'
              }`}
            >
              3
            </div>
            <span className="ml-2 text-sm font-medium">Confirmación</span>
          </div>
        </div>
      </div>

      {/* Renderizamos según el paso actual */}
      {purchaseStep === PurchaseStep.SELECT_TICKETS && renderSelectTickets()}
      {purchaseStep === PurchaseStep.PAYMENT && renderPayment()}
      {purchaseStep === PurchaseStep.CONFIRMATION && renderConfirmation()}
    </div>
  );
};

export default Purchase;

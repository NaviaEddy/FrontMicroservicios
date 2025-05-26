import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { usePurchases } from '../context/PurchaseContext';
import { CalendarIcon, MapPinIcon, CreditCardIcon, CheckCircleIcon } from 'lucide-react';
enum PurchaseStep {
  SELECT_TICKETS,
  PAYMENT,
  CONFIRMATION,
}
const Purchase: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    getEvent
  } = useEvents();
  const {
    createPurchase,
    processPurchase,
    isLoading,
    error
  } = usePurchases();
  const [quantity, setQuantity] = useState(1);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>(PurchaseStep.SELECT_TICKETS);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [formError, setFormError] = useState('');
  const event = id ? getEvent(id) : undefined;
  useEffect(() => {
    if (!event) {
      navigate('/events');
    }
  }, [event, navigate]);
  if (!event) {
    return <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>;
  }
  const ticketsRemaining = event.capacity - event.ticketsSold;
  const totalPrice = event.ticketPrice * quantity;
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleContinueToPayment = async () => {
    try {
      if (!id) return;
      const purchase = await createPurchase(id, quantity);
      setPurchaseId(purchase.id);
      setPurchaseStep(PurchaseStep.PAYMENT);
    } catch (err) {
      // Error is handled by the context
    }
  };
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    // Simple validation
    if (!paymentDetails.cardNumber || !paymentDetails.cardName || !paymentDetails.expiryDate || !paymentDetails.cvv) {
      setFormError('Please fill in all payment details');
      return;
    }
    if (paymentDetails.cardNumber.length < 16) {
      setFormError('Please enter a valid card number');
      return;
    }
    if (paymentDetails.cvv.length < 3) {
      setFormError('Please enter a valid CVV');
      return;
    }
    if (purchaseId) {
      const result = await processPurchase(purchaseId, paymentDetails);
      if (result) {
        setPurchaseStep(PurchaseStep.CONFIRMATION);
      }
    }
  };
  const renderSelectTickets = () => <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Tickets</h2>
      <div className="mb-6 flex items-center">
        <img src={event.imageUrl} alt={event.name} className="w-24 h-24 object-cover rounded-md mr-4" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
          <div className="flex items-center text-gray-600 mt-1">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {new Date(event.date).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            </span>
          </div>
          <div className="flex items-center text-gray-600 mt-1">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Number of tickets
        </label>
        <select id="quantity" value={quantity} onChange={handleQuantityChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          {[...Array(Math.min(10, ticketsRemaining))].map((_, i) => <option key={i + 1} value={i + 1}>
              {i + 1} {i === 0 ? 'ticket' : 'tickets'}
            </option>)}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {ticketsRemaining} tickets remaining
        </p>
      </div>
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Price per ticket:</span>
          <span className="text-gray-900">${event.ticketPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Quantity:</span>
          <span className="text-gray-900">{quantity}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>}
      <div className="flex justify-between">
        <Link to={`/events/${id}`} className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          Back to event
        </Link>
        <button onClick={handleContinueToPayment} disabled={isLoading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
          {isLoading ? 'Processing...' : 'Continue to payment'}
        </button>
      </div>
    </div>;
  const renderPayment = () => <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Payment Information
      </h2>
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Event:</span>
          <span className="text-gray-900">{event.name}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Date:</span>
          <span className="text-gray-900">
            {new Date(event.date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Tickets:</span>
          <span className="text-gray-900">{quantity}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>
      {(error || formError) && <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {formError || error}
        </div>}
      <form onSubmit={handleProcessPayment} className="space-y-4">
        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
            Name on card
          </label>
          <input type="text" id="cardName" name="cardName" value={paymentDetails.cardName} onChange={handlePaymentChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="John Smith" />
        </div>
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Card number
          </label>
          <input type="text" id="cardNumber" name="cardNumber" value={paymentDetails.cardNumber} onChange={handlePaymentChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="1234 5678 9012 3456" maxLength={16} />
        </div>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry date
            </label>
            <input type="text" id="expiryDate" name="expiryDate" value={paymentDetails.expiryDate} onChange={handlePaymentChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="MM/YY" maxLength={5} />
          </div>
          <div className="w-1/2">
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input type="text" id="cvv" name="cvv" value={paymentDetails.cvv} onChange={handlePaymentChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="123" maxLength={4} />
          </div>
        </div>
        <div className="pt-4 flex justify-between">
          <button type="button" onClick={() => setPurchaseStep(PurchaseStep.SELECT_TICKETS)} className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Back
          </button>
          <button type="submit" disabled={isLoading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
            <CreditCardIcon className="h-5 w-5 mr-2" />
            {isLoading ? 'Processing payment...' : 'Complete purchase'}
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          This is a demo application. No real payment will be processed.
        </p>
      </form>
    </div>;
  const renderConfirmation = () => <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircleIcon className="h-12 w-12 text-green-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Purchase Confirmed!
      </h2>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. An email confirmation has been sent.
      </p>
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Purchase Details
        </h3>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Event:</span>
          <span className="text-gray-900">{event.name}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Date:</span>
          <span className="text-gray-900">
            {new Date(event.date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Location:</span>
          <span className="text-gray-900">{event.location}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Tickets:</span>
          <span className="text-gray-900">{quantity}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total paid:</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <Link to="/events" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          Browse more events
        </Link>
      </div>
    </div>;
  return <div className="max-w-2xl mx-auto">
      {/* Purchase Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${purchaseStep >= PurchaseStep.SELECT_TICKETS ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${purchaseStep >= PurchaseStep.SELECT_TICKETS ? 'bg-indigo-100' : 'bg-gray-100'}`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Select Tickets</span>
          </div>
          <div className={`flex-grow border-t ${purchaseStep > PurchaseStep.SELECT_TICKETS ? 'border-indigo-600' : 'border-gray-200'} mx-4`}></div>
          <div className={`flex items-center ${purchaseStep >= PurchaseStep.PAYMENT ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${purchaseStep >= PurchaseStep.PAYMENT ? 'bg-indigo-100' : 'bg-gray-100'}`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Payment</span>
          </div>
          <div className={`flex-grow border-t ${purchaseStep > PurchaseStep.PAYMENT ? 'border-indigo-600' : 'border-gray-200'} mx-4`}></div>
          <div className={`flex items-center ${purchaseStep >= PurchaseStep.CONFIRMATION ? 'text-indigo-600' : 'text-gray-400'}`}>
            <div className={`flex items-center justify-center h-8 w-8 rounded-full ${purchaseStep >= PurchaseStep.CONFIRMATION ? 'bg-indigo-100' : 'bg-gray-100'}`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Confirmation</span>
          </div>
        </div>
      </div>
      {purchaseStep === PurchaseStep.SELECT_TICKETS && renderSelectTickets()}
      {purchaseStep === PurchaseStep.PAYMENT && renderPayment()}
      {purchaseStep === PurchaseStep.CONFIRMATION && renderConfirmation()}
    </div>;
};
export default Purchase;
import React, { useState } from 'react';
import { useEvents } from '../context/EventContext';
import { CalendarIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon } from 'lucide-react';

type EventFormData = {
  nombre: string;
  fecha: string;
  lugar: string;
  capacidad: number;
  precio: number;
};

const AdminDashboard: React.FC = () => {
  const { events, createEvent, updateEvent, deleteEvent, isLoading, error } = useEvents();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    nombre: '',
    fecha: '',
    lugar: '',
    capacidad: 1,
    precio: 0,
  });
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setFormData({ nombre: '', fecha: '', lugar: '', capacidad: 1, precio: 0 });
    setFormError('');
  };

  const handleCreateClick = () => {
    resetForm();
    setIsCreating(true);
    setIsEditing(null);
  };

  const handleEditClick = (id: number) => {
    const evt = events.find(e => e.id === id);
    if (!evt) return;
    const formattedDate = new Date(evt.fecha).toISOString().slice(0, 16);
    setFormData({ nombre: evt.nombre, fecha: formattedDate, lugar: evt.lugar, capacidad: evt.capacidad, precio: evt.precio });
    setIsEditing(id);
    setIsCreating(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    if (!formData.nombre) return 'Nombre es requerido';
    if (!formData.fecha) return 'Fecha es requerida';
    if (!formData.lugar) return 'Lugar es requerido';
    if (formData.capacidad <= 0) return 'Capacidad debe ser mayor a 0';
    if (formData.precio < 0) return 'Precio no puede ser negativo';
    return null;
  };

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
      } else if (isEditing !== null) {
        await updateEvent(isEditing, formData);
      }
      setIsCreating(false);
      setIsEditing(null);
      resetForm();
    } catch {
      setFormError('Error al guardar el evento.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Seguro que deseas eliminar este evento?')) {
      await deleteEvent(id);
    }
  };

  const renderForm = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">
        {isCreating ? 'Crear Evento' : 'Editar Evento'}
      </h2>
      {(error || formError) && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {formError || error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha y Hora</label>
          <input
            type="datetime-local"
            name="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Lugar</label>
          <input
            name="lugar"
            value={formData.lugar}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Capacidad</label>
            <input
              type="number"
              name="capacidad"
              min="1"
              value={formData.capacidad}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Precio</label>
            <input
              type="number"
              name="precio"
              step="0.01"
              value={formData.precio}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => { setIsCreating(false); setIsEditing(null); }}
            className="px-4 py-2 border rounded-md"
          >Cancelar</button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            {isLoading ? 'Guardando...' : isCreating ? 'Crear' : 'Actualizar'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {!isCreating && isEditing === null && (
          <button onClick={handleCreateClick} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md">
            <PlusIcon className="h-5 w-5 mr-2" /> Crear Evento
          </button>
        )}
      </div>
      {(isCreating || isEditing !== null) && renderForm()}

      <div className="bg-white rounded-lg shadow overflow-auto">
        <div className="px-4 py-5">
          <h2 className="text-lg font-medium">Gestionar Eventos</h2>
        </div>
        {isLoading && !isCreating && isEditing === null ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-indigo-500 rounded-full" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lugar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map(evt => (
                <tr key={evt.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{evt.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center text-sm text-gray-900">
                    <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {new Date(evt.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{evt.lugar}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{evt.capacidad}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${evt.precio.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex space-x-2 text-sm font-medium">
                    <button onClick={() => window.open(`/events/${evt.id}`, '_blank')} className="text-indigo-600 hover:text-indigo-900">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleEditClick(evt.id)} className="text-blue-600 hover:text-blue-900">
                      <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(evt.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

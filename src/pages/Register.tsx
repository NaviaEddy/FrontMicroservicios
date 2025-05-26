import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [ci, setCi] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nombres || !apellidos || !ci || !direccion || !telefono || !email || !contrasenia || !confirmPassword) {
      setFormError('Por favor, completa todos los campos.');
      return;
    }

    if (contrasenia !== confirmPassword) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }

    const success = await register({
      nombres,
      apellidos,
      ci,
      direccion,
      telefono,
      email,
      contrasenia
    });

    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white py-8 px-6 shadow rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Crear una cuenta
        </h2>
        {(error || formError) && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {formError || error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Nombres" value={nombres} onChange={setNombres} />
          <Input label="Apellidos" value={apellidos} onChange={setApellidos} />
          <Input label="CI" value={ci} onChange={setCi} />
          <Input label="Dirección" value={direccion} onChange={setDireccion} />
          <Input label="Teléfono" value={telefono} onChange={setTelefono} />
          <Input label="Correo electrónico" value={email} type="email" onChange={setEmail} />
          <Input label="Contraseña" type="password" value={contrasenia} onChange={setContrasenia} />
          <Input label="Confirmar contraseña" type="password" value={confirmPassword} onChange={setConfirmPassword} />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente reutilizable de entrada
const Input = ({
  label,
  value,
  onChange,
  type = 'text'
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  </div>
);

export default Register;

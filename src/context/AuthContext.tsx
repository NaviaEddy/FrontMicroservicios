import React, { useEffect, useState, createContext, useContext } from 'react';
// Types
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};
type RegisterPayload = {
  nombres: string;
  apellidos: string;
  ci: string;
  direccion: string;
  telefono: string;
  email: string;
  contrasenia: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterPayload) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = () => {
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        try {
          const decodedUser = decodeToken(savedToken);
          setToken(savedToken);
          setUser(decodedUser);
        } catch {
          // Token inválido: limpiar sesión
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const decodeToken = (t: string): User => {
    const parts = t.split('.');
    if (parts.length !== 3) throw new Error('Token inválido');
    try {
      const payload = JSON.parse(atob(parts[1]));
      const name = payload.name;
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        name,
      };
    } catch {
      throw new Error('No se pudo decodificar el token');
    }
  };

  const callApi = async (path: string, body: any): Promise<{ token: string }> => {
    const res = await fetch(path, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok || json.status !== 'success') {
      throw new Error(json.message || 'Error en la API');
    }
    return json.data;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { token: newToken } = await callApi('http://localhost:8080/auth/SignIn', { email, contrasenia: password });
      const decoded = decodeToken(newToken);
      setToken(newToken);
      setUser(decoded);
      localStorage.setItem('auth_token', newToken);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterPayload): Promise<boolean> => {
  setIsLoading(true);
  setError(null);
  try {
   
    const payload = { ...data, rol: 'user' };

    
    const res = await fetch('http://localhost:8080/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!res.ok || json.status !== 'success') {
      throw new Error(json.message || 'Error al registrar');
    }

    const { token: newToken, user } = json.data;

    // Decodifica el token
    const decoded = decodeToken(newToken);
    setToken(newToken);
    setUser(decoded);

    // Guarda en localStorage
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(decoded));

    return true;
  } catch (err: any) {
    setError(err.message);
    return false;
  } finally {
    setIsLoading(false);
  }
};

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

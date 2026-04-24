import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { api } from '@/lib/api';
import type { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const session = api.auth.getSession();
    setState(session);
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    //console.log(username);
    //console.log(password);
    const response = await fetch('http://127.0.0.1:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Invalid username or password');
    }

    const user: User = data;

    localStorage.setItem('user', JSON.stringify(user));

    setState({
      user,
      isAuthenticated: true,
    });

    return user;
  };

  const register = async (
  username: string,
  email: string,
  password: string
): Promise<void> => {

  console.log(username)
  console.log(email)
  const response = await fetch('http://127.0.0.1:5000/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();
  console.log(response.status)
  
  if (response.status === 409) {
  throw new Error('Email or username already exists');
  } 
  else if (!response.ok) {
    throw new Error(data.detail || data.message || 'Registration failed');
  }

  const user: User = data;

  localStorage.setItem('user', JSON.stringify(user));

  setState({
    user,
    isAuthenticated: true,
  });
};

  const logout = () => {
    api.auth.logout();
    localStorage.removeItem('user');

    setState({
      user: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
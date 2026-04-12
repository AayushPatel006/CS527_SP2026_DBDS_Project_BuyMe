import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import type { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isAuthenticated: false });

  useEffect(() => {
    const session = api.auth.getSession();
    setState(session);
  }, []);

  const login = async (username: string, password: string) => {
    const user = await api.auth.login(username, password);
    setState({ user, isAuthenticated: true });
  };

  const register = async (username: string, email: string, password: string) => {
    const user = await api.auth.register(username, email, password);
    setState({ user, isAuthenticated: true });
  };

  const logout = () => {
    api.auth.logout();
    setState({ user: null, isAuthenticated: false });
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

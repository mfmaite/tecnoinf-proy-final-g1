"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Role = 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE'

export interface AuthUser {
  ci: string;
  name: string;
  email: string;
  description?: string;
  pictureUrl?: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const userRaw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
      if (storedToken) setToken(storedToken);
      if (userRaw) setUser(JSON.parse(userRaw));
    } catch {
      console.error('Error al obtener el token y el usuario');
    }
  }, []);

  const setSession = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: !!token,
    setSession,
    clearSession,
  }), [user, token]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useAuthUser() {
  const { user } = useAuth();
  return user;
}

export function useAuthToken() {
  const { token } = useAuth();
  return token;
}



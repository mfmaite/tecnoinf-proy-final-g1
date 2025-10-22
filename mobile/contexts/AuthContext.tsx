import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { login as loginService } from "../services/auth";

type AuthContextType = {
  token: string | null;
  login: (ci: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("token");
        if (storedToken) setToken(storedToken);
      } catch {
        await SecureStore.deleteItemAsync("token");
      }
    };
    loadToken();
  }, []);

  const login = async (ci: string, password: string) => {
    try {
      const { token } = await loginService(ci, password);
      if (!token) throw new Error("No se recibió token del servidor");
      setToken(token);
      await SecureStore.setItemAsync("token", token);
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      await SecureStore.deleteItemAsync("token");
    } catch (error) {
      console.error("Error en logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

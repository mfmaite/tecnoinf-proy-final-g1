import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { login as loginService } from "../services/auth";
import { changePassword as changePasswordService } from "../services/userService";
import { api } from "../services/api"; // ✅ Import necesario para setear headers globales

// ─────────────────────────────────────────────
// 🧩 Tipos
// ─────────────────────────────────────────────
type User = {
  ci: string;
  name: string;
  email: string;
  description?: string;
  pictureUrl?: string;
  role: "ADMIN" | "PROFESOR" | "ESTUDIANTE" | string;
};

/**
 * Tipado del contexto de autenticación.
 */
type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (ci: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
  changePassword: (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;

  isAuthenticated: boolean;
  isProfessor: boolean;
  isStudent: boolean;
};

/**
 * Creación del contexto
 */
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/**
 * Provider global de autenticación
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // 🔹 Cargar sesión almacenada al iniciar la app
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("token");
        const storedUser = await SecureStore.getItemAsync("user");

        if (storedToken) {
          setToken(storedToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`; // ✅ Header global
        }

        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (err) {
        console.warn("[AuthContext] Error restaurando sesión:", err);
        await SecureStore.deleteItemAsync("token");
        await SecureStore.deleteItemAsync("user");
      }
    })();
  }, []);

  // ─────────────────────────────────────────────
  // 🔹 Sincronizar el header global de Axios cuando cambia el token
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // ─────────────────────────────────────────────
  // 🔹 Login
  // ─────────────────────────────────────────────
  const login = async (ci: string, password: string) => {
    try {
      const { token, user } = await loginService(ci, password);
      if (!token) throw new Error("No se recibió token del servidor.");

      setToken(token);
      setUser(user);

      // ✅ Setear header global inmediato
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify(user));
    } catch (error) {
      console.error("[AuthContext] Error en login:", error);
      throw error;
    }
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common["Authorization"];
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
    } catch (error) {
      console.error("[AuthContext] Error en logout:", error);
    }
  };

  // 🔹 Actualizar datos del usuario localmente
  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    try {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      await SecureStore.setItemAsync("user", JSON.stringify(newUser));
    } catch (error) {
      console.error("[AuthContext] Error al actualizar usuario:", error);
      throw error;
    }
  };

  // ─────────────────────────────────────────────
  // 🔹 Cambiar contraseña
  // ─────────────────────────────────────────────
  const changePassword = async (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      await changePasswordService(oldPassword, newPassword, confirmPassword);
    } catch (error) {
      console.error("[AuthContext] Error al cambiar contraseña:", error);
      throw error;
    }
  };

  // 🔹 Helpers derivados del estado actual
  const isAuthenticated = !!token;
  const isProfessor =
    user?.role === "PROFESOR" || user?.role === "ADMIN" || false;
  const isStudent = user?.role === "ESTUDIANTE" || false;

  // ─────────────────────────────────────────────
  // 🔹 Provider
  // ─────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        updateUser,
        changePassword,
        isAuthenticated,
        isProfessor,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

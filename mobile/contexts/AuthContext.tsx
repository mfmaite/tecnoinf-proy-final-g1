import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { login as loginService } from "../services/auth";
import { changePassword as changePasswordService } from "../services/userService";
import { api } from "../services/api";

type User = {
  ci: string;
  name: string;
  email: string;
  description?: string;
  pictureUrl?: string;
  role: "ADMIN" | "PROFESOR" | "ESTUDIANTE" | string;
};

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
  loadingAuth: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("token");
        const storedUser = await SecureStore.getItemAsync("user");

        if (storedToken) {
          setToken(storedToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        }

        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (err) {
        console.warn("[AuthContext] Error restaurando sesión:", err);
        await SecureStore.deleteItemAsync("token");
        await SecureStore.deleteItemAsync("user");
      } finally {
        setLoadingAuth(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete api.defaults.headers.common["Authorization"];
  }, [token]);

  const login = async (ci: string, password: string) => {
    const { token, user } = await loginService(ci, password);
    setToken(token);
    setUser(user);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("user", JSON.stringify(user));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...data };
    setUser(newUser);
    await SecureStore.setItemAsync("user", JSON.stringify(newUser));
  };

  const changePassword = changePasswordService;

  const isAuthenticated = !!token;
  const isProfessor = user?.role === "PROFESOR" || user?.role === "ADMIN";
  const isStudent = user?.role === "ESTUDIANTE";

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
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

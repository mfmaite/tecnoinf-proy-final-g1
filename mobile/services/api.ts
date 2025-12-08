import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// ✅ Interceptor de respuesta: manejo centralizado de errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn(" Token inválido o expirado. Eliminando sesión...");
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
    }
    return Promise.reject(error);
  }
);

// contexts/NotificationContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import axios from "axios";
import { useAuth } from "./AuthContext"; // ⬅️ clave: dependemos del usuario logueado

interface NotificationContextType {
  fcmToken: string | null;
  lastNotification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification debe ser usado dentro de NotificationProvider"
    );
  }
  return context;
};

interface Props {
  children: ReactNode;
}

export function NotificationProvider({ children }: Props) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { user } = useAuth(); // ⬅️ solo registramos token si hay usuario autenticado

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "";

  async function sendTokenToBackend(token: string) {
    try {
      await axios.post(`${API_URL}/users/device-token`, { token });
      console.log("📩 Token FCM guardado en backend:", token);
    } catch (err) {
      console.warn("⚠️ Error enviando token al backend:", err);
    }
  }

  async function registerPushToken() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const result = await Notifications.requestPermissionsAsync();
        if (result.status !== "granted") return;
      }

      const { data: fcm } = await Notifications.getDevicePushTokenAsync();
      if (!fcm) return;

      setFcmToken(fcm);
      await sendTokenToBackend(fcm);
    } catch (e) {
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      setError(new Error(`Error registrando token push: ${msg}`));
    }
  }

  // ✨ SOLO se ejecuta cuando hay usuario autenticado
  useEffect(() => {
    if (user) registerPushToken();
  }, [user]);

  // listeners globales de notificaciones
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📥 Notificación recibida:", notification);
        setLastNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("👆 Usuario interactuó con notificación:", data);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ fcmToken, lastNotification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

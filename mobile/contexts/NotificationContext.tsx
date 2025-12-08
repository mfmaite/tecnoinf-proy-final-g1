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
import { registerForPushNotificationsAsync } from "../notifications/registerForPushNotificationsAsync";
import axios from "axios";
import Constants from "expo-constants";

interface NotificationContextType {
  expoPushToken: string | null;
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
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "";

  async function sendTokenToBackend(token: string) {
    try {
      await axios.post(`${API_URL}/notifications/register-device`, { token });
      console.log(" Token guardado en backend:", token);
    } catch (err) {
      console.warn(" Error enviando token al backend:", err);
    }
  }

  useEffect(() => {
    let isMounted = true;

    registerForPushNotificationsAsync()
      .then((token) => {
        if (isMounted && token) {
          setExpoPushToken(token);
          sendTokenToBackend(token);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(" Notificación recibida:", notification);
        setLastNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log(" Usuario tocó notificación:", data);
      });

    return () => {
      isMounted = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, lastNotification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

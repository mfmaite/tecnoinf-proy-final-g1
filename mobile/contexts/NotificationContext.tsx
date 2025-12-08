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

  // Tipado recomendado para la versión de expo-notifications que usás
  const notificationListener = useRef<
    ReturnType<typeof Notifications.addNotificationReceivedListener> | null
  >(null);

  const responseListener = useRef<
    ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null
  >(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => setExpoPushToken(token),
      (err) => setError(err instanceof Error ? err : new Error(String(err)))
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notificación recibida:", notification);
        setLastNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("👆 Usuario tocó notificación:", data);
      });

    return () => {
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

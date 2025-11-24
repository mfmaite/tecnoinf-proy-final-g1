// notifications/notificationListeners.ts
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export function useNotificationListeners() {
  const router = useRouter();

  useEffect(() => {
    // Cuando la app está abierta y llega una notificación
    const foregroundListener =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📲 Notificación recibida en foreground:", notification);
      });

    // Cuando el usuario toca la notificación
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Usuario tocó notificación:", response);

        const link = response.notification.request.content.data?.link;

        if (link) {
          router.push({ pathname: link as any });
        }
      });

    // Limpiar listeners
    return () => {
      foregroundListener.remove();
      responseListener.remove();
    };
  }, []);
}

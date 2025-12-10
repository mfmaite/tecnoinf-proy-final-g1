// notifications/notificationListeners.ts

import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export function useNotificationListeners() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log("➡️ Usuario abrió notificación:", data);

        const link = data?.link;
        if (link) {
          // El link debería ser algo como "/(main)/courses/123"
          router.push(link as any);
        }
      }
    );

    return () => subscription.remove();
  }, [router]);
}

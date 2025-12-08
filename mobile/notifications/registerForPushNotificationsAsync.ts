// notifications/registerForPushNotificationsAsync.ts

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Handler global para foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,

    // Requeridos en SDK 50+
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  // Android Notification Channel (obligatorio)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Simuladores no soportan push
  if (!Device.isDevice) {
    throw new Error(
      "Debe usarse un dispositivo físico para recibir notificaciones push."
    );
  }

  // Pedir permisos al usuario
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    throw new Error("Permiso de notificaciones denegado.");
  }

  // Obtener projectId (requerido por EAS)
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error(
      "No se encontró 'projectId'. Revisá app.config.js → extra.eas.projectId"
    );
  }

  try {
    // Delay necesario para inicializar FCM en Android Release
    await new Promise((resolve) => setTimeout(resolve, 250));

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const pushToken = tokenResponse.data;

    console.log("📲 Expo Push Token generado:", pushToken);
    return pushToken;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    throw new Error(`Error obteniendo Expo Push Token: ${msg}`);
  }
}

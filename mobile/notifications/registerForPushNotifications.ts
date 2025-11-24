// notifications/registerForPushNotifications.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  // Pedimos permisos
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Permiso de notificaciones no concedido");
    return null;
  }

  // Obtenemos token de Expo
  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: "TU_PROJECT_ID_EXPO",
      // ejemplo: "c28f0c8d-4bd3-42e1-8d58-9157a9e2c83d"
    })
  ).data;

  console.log("Expo Push Token:", token);

  return token;
}

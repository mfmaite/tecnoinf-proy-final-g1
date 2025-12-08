// notifications/registerForPushNotificationsAsync.ts

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    throw new Error("Debe usarse un dispositivo físico para recibir notificaciones push");
  }


  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    throw new Error("Permiso de notificaciones denegado");
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error(
      "No se encontró projectId. Revisá app.json → expo.extra.eas.projectId"
    );
  }

  try {
    const pushToken = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;

    console.log("📲 Expo Push Token generado:", pushToken);

    return pushToken;
  } catch (e: unknown) {
    throw new Error(`Error obteniendo Expo Push Token: ${e}`);
  }
}

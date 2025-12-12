// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { Slot, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { NotificationProvider, useNotification } from "../contexts/NotificationContext"
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { ActivityIndicator, View } from "react-native";
import { api } from "../services/api";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useActivityNavigation } from "../hooks/useActivityNavigation";

//  Configuración global de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   // muestra alerta nativa
    shouldPlaySound: true,   // suena al llegar
    shouldSetBadge: true,    // modifica badge del ícono
    shouldShowBanner: true,  // iOS: muestra banner arriba
    shouldShowList: true,    // iOS: aparece en Notification Center
  }),
});


export default function RootLayout() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NotificationProvider>
  );
}

function AppNavigator() {
  const { token } = useAuth();
  const { fcmToken } = useNotification();
  const router = useRouter();
  const { navigateByActivityLink } = useActivityNavigation();

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Verificamos login una única vez
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await SecureStore.getItemAsync("token");
      setIsLoggedIn(!!storedToken);
      setLoading(false);
    };
    checkToken();
  }, [token]);

  // Guardar token de notificaciones en backend
  useEffect(() => {
    const savePushToken = async () => {
      if (fcmToken && isLoggedIn) {
        try {
          await api.post("/users/device-token", {
            token: fcmToken,
          });
          console.log("Token guardado en backend");
        } catch (e) {
          console.log("Error guardando token en backend", e);
        }
      }
    };
    savePushToken();
  }, [fcmToken, isLoggedIn]);

  // Handler de deep linking global (reset-password + activity links)
  useEffect(() => {

    // App abierta por un deep link (cold start)
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (!initialUrl) return;

      const parsed = Linking.parse(initialUrl);

      // Caso especial reset-password (mantener tu lógica existente)
      if (parsed?.path === "reset-password" && parsed.queryParams?.token) {
        router.push(`/reset-password?token=${parsed.queryParams.token}`);
        return;
      }

      // Otros deep links → usar activity navigation
      navigateByActivityLink(initialUrl);
    };

    checkInitialUrl();

    // Listener cuando la app ya está abierta y llega un deep link nuevo
    const subscription = Linking.addEventListener("url", (event) => {
      const parsed = Linking.parse(event.url);

      // Caso especial reset-password
      if (parsed?.path === "reset-password" && parsed.queryParams?.token) {
        router.push(`/reset-password?token=${parsed.queryParams.token}`);
        return;
      }

      // Cualquier otro link → hook universal
      navigateByActivityLink(event.url);
    });

    return () => subscription.remove();
  }, [router, navigateByActivityLink]);



  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  return <Slot key={isLoggedIn ? "(main)" : "(auth)"} />;
}

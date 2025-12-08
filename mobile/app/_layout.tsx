// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { Slot, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { NotificationProvider, useNotification } from "../contexts/tuviejaentanga"
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { ActivityIndicator, View } from "react-native";
import { api } from "../services/api";

// 🔔 Configuración global
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
  const { token } = useAuth(); // auth token backend
  const { expoPushToken } = useNotification(); // token de Expo
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await SecureStore.getItemAsync("token");
      setIsLoggedIn(!!storedToken);
      setLoading(false);
    };
    checkToken();
  }, [token]);

  // 📲 Enviar token al backend si estamos logueados
  useEffect(() => {
    const savePushToken = async () => {
      if (expoPushToken && isLoggedIn) {
        try {
          await api.post("/users/device-token", {
            token: expoPushToken,
          });
          console.log("🔥 Token guardado en backend");
        } catch (e) {
          console.log("❌ Error guardando token en backend", e);
        }
      }
    };
    savePushToken();
  }, [expoPushToken, isLoggedIn]);

  // 🔗 Deep linking global (igual que antes)
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      const { path, queryParams } = Linking.parse(event.url);

      if (path === "reset-password" && queryParams?.token) {
        router.push(`/reset-password?token=${queryParams.token}`);
      }
    });

    return () => subscription.remove();
  }, [router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot key={isLoggedIn ? "(main)" : "(auth)"} />;
}

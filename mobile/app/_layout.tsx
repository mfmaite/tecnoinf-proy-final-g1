// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { Slot, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

function AppNavigator() {
  const { token } = useAuth();

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Buscamos el token guardado en el almacenamiento seguro
        const storedToken = await SecureStore.getItemAsync("token");

        // Si existe, el usuario tiene sesión activa
        setIsLoggedIn(!!storedToken);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoggedIn(false);
      } finally {
        // Terminamos la carga
        setLoading(false);
      }
    };

    checkToken();
  }, [token]);

  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      const url = event.url;
      const { path, queryParams } = Linking.parse(url);

      if (path === "reset-password" && queryParams?.token) {
        router.push(`/reset-password?token=${queryParams.token}`);
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl } as Linking.EventType);
      }
    };
    checkInitialUrl();

    return () => subscription.remove();
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot key={isLoggedIn ? "(main)" : "(auth)"} />;
}

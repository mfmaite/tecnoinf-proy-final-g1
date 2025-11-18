// app/_layout.tsx
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SessionGate />
    </AuthProvider>
  );
}

function SessionGate() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);

  // ───────────────────────────────────────────────
  // 🔐 Chequear token en secure storage
  // ───────────────────────────────────────────────
  useEffect(() => {
    async function loadToken() {
      try {
        const storedToken = await SecureStore.getItemAsync("token");
        setLoggedIn(!!storedToken);
      } catch (err) {
        console.error("Error reading token:", err);
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }
    loadToken();
  }, []);

  // ───────────────────────────────────────────────
  // 🔗 Manejo de deep linking (reset-password)
  // ───────────────────────────────────────────────
  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      const url = event.url;
      const { path, queryParams } = Linking.parse(url);

      // Ejemplo URL: myapp://reset-password?token=abc123
      if (path === "reset-password" && queryParams?.token) {
        router.push(`/reset-password?token=${queryParams.token}`);
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Para links que abren la app desde cero
    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial) handleDeepLink({ url: initial } as Linking.EventType);
    })();

    return () => subscription.remove();
  }, []);

  // ───────────────────────────────────────────────
  // 🌀 Pantalla de carga inicial
  // ───────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ───────────────────────────────────────────────
  // 🏛️ Root navigation (IMPORTANTE)
  // ───────────────────────────────────────────────
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="(main)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

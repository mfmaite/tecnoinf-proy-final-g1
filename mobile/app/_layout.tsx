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

  // Estado para controlar si ya verificamos el token almacenado
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

    // ✅ Deep Link handler global (para reset-password, etc.)
  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      const url = event.url;
      const { path, queryParams } = Linking.parse(url);

      if (path === "reset-password" && queryParams?.token) {
        router.push(`/reset-password?token=${queryParams.token}`);
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // En caso de que la app se abra directamente desde un deep link (no en ejecución)
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl } as Linking.EventType);
      }
    };
    checkInitialUrl();

    // Maneja si la app se abre directamente desde el link (cerrada)
    // Linking.getInitialURL().then((url) => {
    //   if (url) {
    //     const { path, queryParams } = Linking.parse(url);
    //     if (path === "reset-password" && queryParams?.token) {
    //       router.push({
    //         pathname: "/reset-password",
    //         params: { token: queryParams.token },
    //       });
    //     }
    //   }
    // });

    return () => subscription.remove();
  }, [router]);

  // Mientras verificamos la sesión, mostramos un indicador de carga
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot key={isLoggedIn ? "(main)" : "(auth)"} />;
}

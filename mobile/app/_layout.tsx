// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { Slot } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  return (
    // Mantiene tu AuthProvider para compartir el estado global del usuario/token
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

function AppNavigator() {
  // Obtenemos el token actual desde el contexto (si se actualiza al loguear o cerrar sesión)
  const { token } = useAuth();

  // Estado para controlar si ya verificamos el token almacenado
  const [loading, setLoading] = useState(true);

  // Estado booleano para determinar si hay sesión
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // ✅ Verificación de sesión segura (con SecureStore)
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

  // Mientras verificamos la sesión, mostramos un indicador de carga
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ✅ Si hay sesión, mostramos las rutas del grupo (main)
  // ✅ Si no hay sesión, mostramos las rutas de autenticación (auth)
  // Expo Router renderiza automáticamente el archivo layout correcto según esta clave
  return <Slot key={isLoggedIn ? "(main)" : "(auth)"} />;
}

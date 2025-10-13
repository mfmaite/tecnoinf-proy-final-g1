import React, { useEffect, useState } from "react";
import { Slot } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import * as SecureStore from 'expo-secure-store';
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
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await SecureStore.getItemAsync('token');
      setIsLoggedIn(!!storedToken);
      setLoading(false);
    };
    checkToken();
  }, [token]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirige dinámicamente según el estado de sesión
  return (
    <Slot key={isLoggedIn ? "(main)" : "(auth)"} />
  );
}

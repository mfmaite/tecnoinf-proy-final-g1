import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";

export default function AuthLayout() {
  const { isAuthenticated, loadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      router.replace("/(main)/home");
    }
  }, [loadingAuth, isAuthenticated, router]);

  // evita parpadeo mientras autenticación se restaura
  if (loadingAuth) return null;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
      </Stack>
    </SafeAreaView>
  );
}

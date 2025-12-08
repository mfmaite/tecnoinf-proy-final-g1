import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../styles/styles";
import { colors } from "../../styles/colors";

export default function MainLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Stack
        screenOptions={{
          headerTitleStyle: styles.headerTitle, // 👈 estilo global de headers
          headerTitleAlign: "center",
          headerTintColor: colors.secondary[60],
          headerStyle: { backgroundColor: colors.primary[10] },
        }}
      >
        {/* 🏠 Home */}
        <Stack.Screen
          name="home"
          options={{
            headerShown: true,
            title: "Mentora", // 👈 NO headerTitleStyle aquí
          }}
        />

        {/* 👤 Perfil */}
        <Stack.Screen
          name="profile/index"
          options={{
            headerShown: true,
            title: "Mi Perfil",
          }}
        />

        {/* ✏️ Editar perfil */}
        <Stack.Screen
          name="profile/edit-profile"
          options={{
            headerShown: true,
            title: "Editar perfil",
          }}
        />

        {/* 🔐 Cambiar contraseña */}
        <Stack.Screen
          name="profile/change-password"
          options={{
            headerShown: true,
            title: "Cambiar contraseña",
          }}
        />
      </Stack>
    </SafeAreaView>
  );
}

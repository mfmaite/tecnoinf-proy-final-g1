// app/(main)/_layout.tsx
import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, 
      }}
    >

      {/* Tabs principal */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />

      {/* Rutas que DEBEN mostrar header */}
      <Stack.Screen
        name="profile/index"
        options={{
          title: "Mi Perfil",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="profile/change-password"
        options={{
          title: "Cambiar contraseña",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="profile/edit-profile"
        options={{
          title: "Editar perfil",
          headerShown: true,
        }}
      />

      {/* IMPORTANTE: incluir cursos dentro del stack */}
      <Stack.Screen
        name="(courses)"
        options={{
          headerShown: false, 
        }}
      />

    </Stack>
  );
}

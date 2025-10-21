import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: "Inicio" }} />
      <Stack.Screen name="altaUsuarios" options={{ title: "Alta de usuarios" }} />
    </Stack>
  );
}

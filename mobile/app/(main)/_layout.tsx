import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: "Mentora" }} />
    </Stack>
  );
}

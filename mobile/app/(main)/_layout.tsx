import { Stack } from "expo-router";
import { styles } from "../../styles/styles";

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: "Mentora"
        , headerTitleStyle: styles.title, }} />
    </Stack>
  );
}

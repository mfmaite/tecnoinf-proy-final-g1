import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { screenOptions as listOptions } from "./coursesList";
import { styles } from "../../styles/styles";
import { colors } from "../../styles/colors";


export default function CoursesLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Stack 
              screenOptions={{
                headerShown: false,
                headerTitleStyle: styles.headerTitle,
                headerTitleAlign: "center",
                headerTintColor: colors.secondary[60],
                headerStyle: { backgroundColor: colors.primary[10] },
            }}>
        {/* 📚 Lista de cursos */}
        <Stack.Screen
          name="coursesList"
          options={listOptions}
        />

        {/* 🎓 Vista de un curso */}
        <Stack.Screen
          name="[courseId]/index"
          options={{
            headerShown: true, 
            title: "Detalle del curso",
          }}
        />

        {/* 👥 Participantes */}
        <Stack.Screen
          name="participants"
          options={{
            headerShown: true,
            title: "Participantes",
          }}
        />

        {/* 💬 Foro */}
        <Stack.Screen
          name="[courseId]/forums/[forumId]"
          options={({ route }: { route: any }) => ({
            headerShown: true,
            title:
              route.params?.forumType === "ANNOUNCEMENTS"
                ? "Foro de Anuncios"
                : "Foro de Consultas",
          })}
        />
        {/* 🧵 Post individual */}
        <Stack.Screen
          name="[courseId]/forums/[forumId]/[postId]"
          options={{
            headerShown: true,
            title: "Publicación",
          }}
        />
      </Stack>
    </SafeAreaView>
  );
}

import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { screenOptions as listOptions } from "./coursesList";
import { colors } from "../../styles/colors";
import { styles } from "../../styles/styles";

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

        <Stack.Screen
          name="coursesList"
          options={listOptions}
        />

        <Stack.Screen
          name="[courseId]/index"
          options={{
            headerShown: true,
            title: "Detalle del curso",
          }}
        />

        <Stack.Screen
          name="[courseId]/contents/[contentId]"
          options={{
            headerShown: true,
            title: "Contenido",
          }}
        />

        <Stack.Screen
          name="[courseId]/evaluations/[evaluationId]"
          options={{
            headerShown: true,
            title: "Evaluación",
          }}
        />

        <Stack.Screen
          name="[courseId]/quizzes/[quizId]"
          options={{
            headerShown: true,
            title: "Quiz",
          }}
        />

        <Stack.Screen
          name="participants"
          options={{
            headerShown: true,
            title: "Participantes",
          }}
        />

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

import { Stack } from "expo-router";

export default function CoursesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >

      {/* Lista general */}
      <Stack.Screen
        name="coursesList"
        options={{
          title: "Cursos",
        }}
      />

      {/* Vista del curso */}
      <Stack.Screen
        name="[courseId]/index"
        options={{
          title: "Detalle del curso",
        }}
      />

      {/* Participantes */}
      <Stack.Screen
        name="[courseId]/participants"
        options={{
          title: "Participantes",
        }}
      />

      {/* Foro */}
      <Stack.Screen
        name="[courseId]/forums/[forumId]"
        options={{
          title: "Foro",
        }}
      />

      {/* Post individual */}
      <Stack.Screen
        name="[courseId]/forums/[forumId]/[postId]"
        options={{
          title: "Post",
        }}
      />

    </Stack>
  );
}

import { Stack } from "expo-router";
import { styles } from "../../styles/styles";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getCourseById } from "../../services/courses";
import { getPostById } from "../../services/posts";
import { useAuth } from "../../contexts/AuthContext";

/**
 * 🔹 Layout principal de las rutas de cursos
 * con títulos dinámicos para curso, foro y post
 */
export default function CoursesLayout() {
  const { courseId, forumId, postId } = useLocalSearchParams<{
    courseId?: string;
    forumId?: string;
    postId?: string;
  }>();

  const { token } = useAuth();
  const [title, setTitle] = useState("Cargando...");

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        // 🧵 Nivel 3: Post individual
        if (postId && forumId) {
          const data = await getPostById(postId);
          const postTitle = data?.post?.authorName
            ? `Post de ${data.post.authorName}`
            : "Post";
          setTitle(postTitle);
          return;
        }

        // 💬 Nivel 2: Foro dentro del curso
        if (forumId && courseId) {
          const course = await getCourseById(courseId);
          const forum = course.course.forums?.find((f) => f.id === forumId);
          const forumTitle =
            forum?.type === "ANNOUNCEMENTS"
              ? "Foro de Anuncios"
              : forum?.type === "CONSULTS"
              ? "Foro de Consultas"
              : "Foro";
          setTitle(forumTitle);
          return;
        }

        // 🎓 Nivel 1: Curso individual
        if (courseId) {
          const data = await getCourseById(courseId);
          setTitle(data.course.name ?? "Detalle del curso");
          return;
        }

        // 📚 Nivel 0: Lista de cursos
        setTitle("Cursos");
      } catch {
        setTitle("Cursos");
      }
    };

    fetchTitle();
  }, [courseId, forumId, postId, token]);

  return (
    <Stack>
      {/* 📚 Lista general */}
      <Stack.Screen
        name="coursesList"
        options={{
          title: "Cursos",
          headerTitleStyle: styles.title,
        }}
      />

      {/* 🎓 Curso principal */}
      <Stack.Screen
        name="[courseId]/index"
        options={{
          title,
          headerTitleStyle: styles.title,
        }}
      />

      {/* 👥 Participantes */}
      <Stack.Screen
        name="participants"
        options={{
          title: "Participantes",
          headerTitleStyle: styles.title,
        }}
      />

      {/* 💬 Foro */}
      <Stack.Screen
        name="[courseId]/forums/[forumId]"
        options={{
          title,
          headerTitleStyle: styles.title,
        }}
      />

      {/* 🧵 Post individual */}
      <Stack.Screen
        name="[courseId]/forums/[forumId]/[postId]"
        options={{
          title,
          headerTitleStyle: styles.title,
        }}
      />
    </Stack>
  );
}

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useAuth } from "../../contexts/AuthContext";
import {
  getUserActivities,
  UserActivity,
} from "../../services/userService";
import { styles } from "../../styles/styles";

export default function RecentActivityScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Convierte un link del backend en { courseId, forumId }
   * Ej: "/courses/AAH2025/forums/4"
   */
  function parseBackendLink(link: string) {
  const parts = link.split("/").filter(Boolean);
  // Ej: ["courses","AAH2025","forums","4","posts","10"]

  // ---------------------------
  // 📌 Caso 1: POST específico
  // /courses/{cId}/forums/{fId}/posts/{pId}
  // ---------------------------
  if (
    parts[0] === "courses" &&
    parts[2] === "forums" &&
    parts[4] === "posts"
  ) {
    return {
      type: "post",
      courseId: parts[1],
      forumId: parts[3],
      postId: parts[5],
      route: `/(courses)/${parts[1]}/forums/${parts[3]}/${parts[5]}`,
    };
  }

  // ---------------------------
  // 📌 Caso 2: FORO
  // /courses/{cId}/forums/{fId}
  // ---------------------------
  if (parts[0] === "courses" && parts[2] === "forums") {
    return {
      type: "forum",
      courseId: parts[1],
      forumId: parts[3],
      route: `/(courses)/${parts[1]}/forums/${parts[3]}`,
    };
  }

  // ---------------------------
  // 📌 Caso 3: CURSO
  // /courses/{cId}
  // ---------------------------
  if (parts[0] === "courses") {
    return {
      type: "course",
      courseId: parts[1],
      route: `/(courses)/${parts[1]}`,
    };
  }

  // ---------------------------
  // 📌 Caso 4: CHAT
  // /chats/{chatId}
  // ---------------------------
  if (parts[0] === "chats") {
    return {
      type: "chat",
      chatId: parts[1],
      route: `/chats/${parts[1]}`, // ⚠️ No existe en mobile aún
    };
  }

  return null;
}


  // ─────────────────────────────────────────────
  // 🔹 Cargar actividades recientes
  // ─────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        if (!user?.ci) return;

        const data = await getUserActivities(user.ci);
        setActivities(data);
      } catch (e) {
        console.error("Error cargando actividades:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  // ─────────────────────────────────────────────
  // 🔹 Render de cada item de actividad
  // ─────────────────────────────────────────────
  const renderItem = ({ item }: { item: UserActivity }) => {
    const parsed = parseBackendLink(item.link);

    return (
      <TouchableOpacity
        disabled={!parsed}
        onPress={() => {
          if (!parsed) return;

          // 🚨 Si existe ruta real, navegar
          if (parsed.route) {
            router.push(parsed.route);
            return;
          }

          // Si el tipo existe pero no tenés aún la pantalla:
          alert("Esta actividad aún no tiene vista en mobile.");
        }}
      >
        <View style={styles.activityCardItem}>
          <Text style={styles.activityDescription}>{item.description}</Text>
          <Text style={styles.activityDate}>
            {new Date(item.createdDate).toLocaleString("es-UY")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ─────────────────────────────────────────────
  // 🔹 Render principal
  // ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : activities.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No hay actividad reciente</Text>
          </View>
        ) : (
          <FlatList
            data={[...activities].reverse()}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

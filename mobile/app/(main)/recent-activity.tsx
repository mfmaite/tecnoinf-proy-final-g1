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

    // parts = ["courses", "AAH2025", "forums", "4"]
    if (parts[0] !== "courses" || parts[2] !== "forums") return null;

    return {
      courseId: parts[1],
      forumId: parts[3],
    };
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
    const route = parseBackendLink(item.link);

    return (
      <TouchableOpacity
        disabled={!route}
        onPress={() => {
          if (!route) return;

          // Navegación usando string (más segura con TS)
          router.push(
            `/courses/${route.courseId}/forums/${route.forumId}`
          );
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

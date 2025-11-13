import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { getUserActivities, UserActivity } from "../../../services/userService";
import { styles } from "../../../styles/styles";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logo = require("../../../assets/images/mentora-logo-small.png");

  // ─────────────────────────────────────────────
  // 🔧 Función que convierte el link del backend
  //    a una ruta válida de expo-router
  // ─────────────────────────────────────────────
  function parseBackendLink(link: string) {
    // Ejemplo recibido:
    // "/courses/AAH2025/forums/4"
    const parts = link.split("/").filter(Boolean);
    // parts = ["courses", "AAH2025", "forums", "4"]

    if (parts[0] !== "courses" || parts[2] !== "forums") {
      console.warn("Link desconocido del backend:", link);
      return null;
    }

    const courseId = parts[1];
    const forumId = parts[3];

    return {
      pathname: "/(courses)/[courseId]/forums/[forumId]",
      params: { courseId, forumId },
    } as const;
  }

  // ─────────────────────────────────────────────
  // 🔹 Cargar actividades
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!user?.ci) return;

        const data = await getUserActivities(user.ci);
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  // ─────────────────────────────────────────────
  // 🔹 Render del item
  // ─────────────────────────────────────────────
  const renderItem = ({ item }: { item: UserActivity }) => {
    const route = parseBackendLink(item.link);

    return (
      <TouchableOpacity
        disabled={!route}
        onPress={() => {
          if (route) router.push(route);
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
    <View style={styles.container}>
      {/* Header con el logo */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image source={logo} style={{ width: 120, height: 120 }} resizeMode="contain" />
        <Text style={styles.title}>Mentora</Text>
        <Text style={[styles.title, { fontSize: 18 }]}>
          ¡Bienvenido, {user?.name || user?.ci}!
        </Text>
      </View>

      {/* Actividad reciente */}
      <Text style={[styles.subtitle, { marginBottom: 10 }]}>
        Actividad reciente
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : activities.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No hay actividad reciente</Text>
        </View>
      ) : (
        <FlatList
          data={[...activities].reverse().slice(0, 15)}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}

      {/* Logout */}
      <TouchableOpacity
        onPress={async () => {
          await logout();
          router.replace("/(auth)/login");
        }}
        style={[styles.buttonPrimary, { marginTop: 20 }]}
      >
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

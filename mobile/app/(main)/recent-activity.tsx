import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import { useAuth } from "../../contexts/AuthContext";
import { getUserActivities, UserActivity } from "../../services/userService";
import { styles } from "../../styles/styles";
import { useActivityNavigation } from "../../hooks/useActivityNavigation";

export default function RecentActivityScreen() {
  const { user } = useAuth();
  const { navigateByActivityLink } = useActivityNavigation();

  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadActivities = async () => {
        try {
          if (!user?.ci) return;

          setLoading(true);

          const data = await getUserActivities(user.ci);

          if (isActive) {
            // Invertimos acá para no hacerlo en el render
            setActivities(data.slice().reverse());
          }
        } catch (error) {
          console.error("Error cargando actividades:", error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadActivities();

      return () => {
        isActive = false;
      };
    }, [user?.ci])
  );

  const renderItem = ({ item }: { item: UserActivity }) => (
    <TouchableOpacity onPress={() => navigateByActivityLink(item.link)}>
      <View style={styles.activityCardItem}>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityDate}>
          {new Date(item.createdDate).toLocaleString("es-UY")}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
            data={activities}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

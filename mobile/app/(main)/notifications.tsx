import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notifications";
import { useRouter } from "expo-router";
import { transformWebLinkToMobile } from "../../utils/linkMapper";
import { styles as globalStyles } from "../../styles/styles";
import { colors } from "../../styles/colors";

interface Notification {
  id: string;
  message: string;
  link: string | null;
  isRead: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (e) {
      console.log("Error cargando notificaciones:", e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handlePress = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      }

      if (notification.link) {
        const mobileLink = transformWebLinkToMobile(notification.link);
        router.push({ pathname: mobileLink as any });
      }
    } catch (e) {
      console.log("Error updating notification:", e);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={localStyles.center}>
        <Text style={localStyles.emptyText}>No tenés notificaciones</Text>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, localStyles.container]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const unread = !item.isRead;
          return (
            <TouchableOpacity
              onPress={() => handlePress(item)}
              activeOpacity={0.85}
              style={[
                localStyles.itemCard,
                unread ? localStyles.itemCardUnread : undefined,
              ]}
            >
              <View style={localStyles.itemRow}>
                <Text style={localStyles.message}>{item.message}</Text>
                {unread ? (
                  <View style={globalStyles.badge}>
                    <Text style={globalStyles.badgeText}>Nuevo</Text>
                  </View>
                ) : null}
              </View>
              {item.link ? (
                <Text style={[globalStyles.link, { marginTop: 6 }]}>
                  Ir a contenido →
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  itemCard: {
    backgroundColor: colors.surfaceLight[10],
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemCardUnread: {
    backgroundColor: colors.primary[20],
    borderColor: colors.primary[20],
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  message: {
    flex: 1,
    fontWeight: "600",
    color: "#1f2937",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyText: {
    color: "#9ca3af",
  },
});

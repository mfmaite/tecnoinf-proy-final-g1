import { useEffect, useState, useMemo } from "react";
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
import { useActivityNavigation } from "../../hooks/useActivityNavigation";
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

  const { navigateByActivityLink } = useActivityNavigation();

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

  const orderedNotifications = useMemo(() => {
    const unread = notifications.filter(n => !n.isRead);
    const read = notifications.filter(n => n.isRead);
    return [...unread, ...read];
  }, [notifications]);

  const handlePress = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      }

      if (notification.link) {
        await navigateByActivityLink(notification.link);
      }
    } catch (e) {
      console.log("Error al procesar la notificación:", e);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.loader}>
        <ActivityIndicator size="large" color={colors.primary[60]} />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={globalStyles.center}>
        <Text style={globalStyles.emptyText}>No tenés notificaciones</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Notification }) => {
    const unread = !item.isRead;

    return (
      <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.85}>
        <View
          style={[
            styles.itemCardBase,
            unread ? styles.itemUnread : styles.itemRead,
          ]}
        >
          <View style={styles.row}>
            <Text style={styles.message}>{item.message}</Text>

            {unread && (
              <View style={globalStyles.badge}>
                <Text style={globalStyles.badgeText}>Nuevo</Text>
              </View>
            )}
          </View>

          {item.link && (
            <Text style={[globalStyles.link, { marginTop: 6 }]}>
              Ir al contenido →
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={orderedNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  itemCardBase: {
    backgroundColor: colors.surfaceLight[10],
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textNeutral[20],
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemUnread: {
    backgroundColor: colors.primary[20],
    borderColor: colors.primary[40],
  },
  itemRead: {
    opacity: 0.7,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  message: {
    flex: 1,
    fontWeight: "600",
    color: colors.textNeutral[50],
  },
});

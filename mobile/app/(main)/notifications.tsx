// app/(main)/notifications.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notifications";
import { useRouter } from "expo-router";
import { transformWebLinkToMobile } from "../../utils/linkMapper";

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
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-gray-400">No tienes notificaciones</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            className={`p-4 mb-3 rounded-xl ${
              item.isRead ? "bg-gray-200" : "bg-blue-200"
            }`}
          >
            <Text className="font-semibold">{item.message}</Text>

            {item.link && (
              <Text className="text-blue-600 mt-1 underline">
                Ir a contenido →
              </Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

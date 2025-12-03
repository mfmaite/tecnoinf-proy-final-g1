import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { getChats } from "../../../services/chat";
import { useAuth } from "../../../contexts/AuthContext";

export default function ChatsListScreen() {
  type Chat = {
    id: number;
    participant1Ci: string;
    participant2Ci: string;
  };
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const data = await getChats();
      // Solo mostramos los que fueron iniciados por un profesor (participant1Ci ≠ alumno actual)
      const filtered = data.filter(
        (chat: Chat) => chat.participant1Ci !== user?.ci
      );

      setChats(filtered);
    } catch (err) {
      console.error("Error cargando chats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#666" }}>
          No tienes mensajes aún.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white", padding: 16 }}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const professorCi = item.participant1Ci;
          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(main)/chats/[partnerCi]",
                  params: {
                    partnerCi: professorCi,
                    chatId: item.id,
                  },
                })
              }
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                Chat con profesor {professorCi}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

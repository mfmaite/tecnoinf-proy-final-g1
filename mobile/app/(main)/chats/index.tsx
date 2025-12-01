import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
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
    load();
  }, []);

  const load = async () => {
    try {
      const data = await getChats();
      setChats(data);
    } catch (err) {
      console.error("Error cargando chats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );

  if (chats.length === 0)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#666" }}>No tienes chats aún.</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "white" }}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const otherCi =
            item.participant1Ci === user?.ci ? item.participant2Ci : item.participant1Ci;

          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/chats/[partnerCi]",
                  params: { partnerCi: otherCi, chatId: item.id },
                })
              }
              style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                Chat con {otherCi}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

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
import { UserProfilePicture } from "@/components/user-profile-picture/user-profile-picture";

type UserParticipant = {
  ci: string;
  name: string;
  pictureUrl?: string | null;
};

type Chat = {
  id: number;
  participant1: UserParticipant;
  participant2: UserParticipant;
};

export default function ChatsListScreen() {
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
          const other =
            item.participant1.ci === user?.ci
              ? item.participant2
              : item.participant1;

          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(main)/chats/[partnerCi]",
                  params: {
                    partnerCi: other.ci,
                    chatId: String(item.id),
                    partnerName: other.name,
                  },
                })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: "#eee",
              }}
            >
              <UserProfilePicture name={other.name} pictureUrl={other.pictureUrl} size="sm" />

              <Text style={{ fontSize: 16, fontWeight: "500", marginLeft: 10 }}>
                {other.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

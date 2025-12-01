import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getChatMessages, sendMessage, getOrCreateChatWith } from "../../../services/chat";
import { useAuth } from "../../../contexts/AuthContext";

export default function ChatScreen() {
  const { partnerCi, chatId } =
    useLocalSearchParams<{ partnerCi?: string; chatId?: string }>();

  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    if (!partnerCi) return;

    try {
      let data: any[] = [];

      if (chatId && !isNaN(Number(chatId))) {
        data = await getChatMessages(Number(chatId));
      } else {
        const chat = await getOrCreateChatWith(partnerCi);
        data = chat.messages ?? [];

        if (data.length === 0) {
          await sendMessage(partnerCi, "Hola! 😊");
        }
      }

      setMessages(
        [...data].sort((a, b) => new Date(a.dateSent).getTime() - new Date(b.dateSent).getTime())
      );
    } catch (err) {
      console.error("Error cargando mensajes", err);
      Alert.alert("Error", "No se pudieron cargar los mensajes.");
    } finally {
      setLoading(false);
    }
  }, [chatId, partnerCi]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const handleSend = async () => {
    if (!text.trim() || isSending || !partnerCi) return;

    try {
      setIsSending(true);
      const msg = await sendMessage(partnerCi, text.trim());

      setMessages((prev) => [...prev, msg]);
      setText("");
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      Alert.alert("Error", "No se pudo enviar el mensaje.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => {
          const mine = item.sendByUserCi === user?.ci;
          return (
            <View
              style={{
                alignSelf: mine ? "flex-end" : "flex-start",
                backgroundColor: mine ? "#4f46e5" : "#e5e7eb",
                padding: 10,
                borderRadius: 12,
                marginVertical: 4,
                maxWidth: "80%",
              }}
            >
              <Text style={{ color: mine ? "white" : "black" }}>{item.message}</Text>
              <Text style={{ fontSize: 10, color: mine ? "#ddd" : "#666", marginTop: 4 }}>
                {new Date(item.dateSent).toLocaleTimeString()}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 16 }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderTopWidth: 1,
          borderColor: "#ddd",
          padding: 10,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 20,
            paddingHorizontal: 12,
            marginRight: 8,
          }}
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje..."
        />

        <TouchableOpacity disabled={isSending} onPress={handleSend}>
          <Text style={{ color: "#4f46e5", fontWeight: "bold" }}>
            {isSending ? "Enviando..." : "Enviar"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

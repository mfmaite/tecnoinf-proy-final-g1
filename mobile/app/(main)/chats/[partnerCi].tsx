import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getChatMessages, sendMessage } from "../../../services/chat";
import { useAuth } from "../../../contexts/AuthContext";

export default function ChatScreen() {
  const { partnerCi, chatId } =
    useLocalSearchParams<{ partnerCi: string; chatId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 🔹 Carga inicial y actualización periódica
  const loadMessages = useCallback(async () => {
    try {
      const data = await getChatMessages(Number(chatId));
      setMessages((prev) => {
        const combined = [...prev, ...data];
        const unique = Array.from(
          new Map(combined.map((msg) => [msg.id, msg])).values()
        );
        return unique.sort(
          (a, b) => new Date(a.dateSent).getTime() - new Date(b.dateSent).getTime()
        );
      });
    } catch (err) {
      console.error("Error cargando mensajes", err);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  // 🔹 Enviar mensaje con protección contra doble envío
  const handleSend = async () => {
    if (!text.trim() || isSending) return;

    try {
      setIsSending(true);
      const newMsg = await sendMessage(partnerCi, text.trim());

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMsg.id);
        return exists ? prev : [...prev, newMsg];
      });

      setText("");
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.error("Error enviando mensaje", err);
    } finally {
      setIsSending(false);
    }
  };

  // 🔹 Loading general
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // 🔹 Render principal
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => `${item.id}-${item.dateSent}-${index}`}
        renderItem={({ item }) => {
          const isMine = item.sendByUserCi === user?.ci;
          if (!user) {
            return (
              <View
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
              >
                <Text>No se encontró el usuario autenticado.</Text>
              </View>
            );
          }

          return (
            <View
              style={{
                alignSelf: isMine ? "flex-end" : "flex-start",
                backgroundColor: isMine ? "#4f46e5" : "#e5e7eb",
                padding: 10,
                borderRadius: 12,
                marginVertical: 4,
                maxWidth: "80%",
              }}
            >
              <Text style={{ color: isMine ? "white" : "black" }}>
                {item.message}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: isMine ? "#ddd" : "#666",
                  marginTop: 4,
                }}
              >
                {new Date(item.dateSent).toLocaleTimeString()}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* 🔹 Caja de texto + botón de envío */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          borderTopWidth: 1,
          borderColor: "#ddd",
          backgroundColor: "#fff",
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
          editable={!isSending}
        />

        <TouchableOpacity
          onPress={handleSend}
          disabled={isSending}
          style={{ opacity: isSending ? 0.6 : 1 }}
        >
          {isSending ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator size="small" color="#4f46e5" />
              <Text style={{ color: "#4f46e5", fontWeight: "bold", marginLeft: 6 }}>
                Enviando...
              </Text>
            </View>
          ) : (
            <Text style={{ color: "#4f46e5", fontWeight: "bold" }}>Enviar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

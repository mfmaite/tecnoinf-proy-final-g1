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
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  getChatMessages,
  getOrCreateChatWith,
  sendMessage,
} from "../../../services/chat";
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

  // 🔹 Cargar mensajes: usa chatId si existe, sino busca o crea chat con partnerCi
  const loadMessages = useCallback(async () => {
    if (!partnerCi) {
      console.warn("❌ No se recibió partnerCi, no se puede cargar el chat");
      return;
    }

    try {
      let data: any[] = [];

      if (chatId && !isNaN(Number(chatId))) {
        // Si tenemos chatId, traemos los mensajes del chat

        data = await getChatMessages(Number(chatId));
      } else {
        // Si no tenemos chatId, buscamos o creamos el chat con el otro usuario
        const chat = await getOrCreateChatWith(partnerCi);
        data = chat.messages ?? [];

        // Si el chat recién se creó y está vacío, mandamos el primer mensaje "inicio"
        if (data.length === 0) {
          await sendMessage(partnerCi, "Hola! :D");
        }
      }

      // Ordenar y setear los mensajes
      const sorted = [...data].sort(
        (a, b) => new Date(a.dateSent).getTime() - new Date(b.dateSent).getTime()
      );
      setMessages(sorted);
    } catch (err: any) {
      console.error("🚨 Error cargando mensajes:", err);
      Alert.alert("Error", "No se pudieron cargar los mensajes.");
    } finally {
      setLoading(false);
    }
  }, [chatId, partnerCi]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  // 🔹 Enviar mensaje
  const handleSend = async () => {
    if (!text.trim() || isSending) return;
    if (!partnerCi) return;

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
      console.error("🚨 Error enviando mensaje:", err);
      Alert.alert("Error", "No se pudo enviar el mensaje.");
    } finally {
      setIsSending(false);
    }
  };

  // 🔹 Loading
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

      {/* Caja de texto + botón de envío */}
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
              <Text
                style={{
                  color: "#4f46e5",
                  fontWeight: "bold",
                  marginLeft: 6,
                }}
              >
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

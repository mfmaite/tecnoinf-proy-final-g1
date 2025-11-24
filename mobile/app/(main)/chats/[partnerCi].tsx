import React, { useEffect, useState, useRef } from "react";
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
  const { partnerCi, chatId } = useLocalSearchParams<{ partnerCi: string; chatId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const loadMessages = async () => {
    try {
      const data = await getChatMessages(Number(chatId));
      setMessages(data);
    } catch (err) {
      console.error("Error cargando mensajes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // refresh cada 5s
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      const newMsg = await sendMessage(partnerCi, text.trim());
      setMessages((prev) => [...prev, newMsg]);
      setText("");
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.error("Error enviando mensaje", err);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isMine = item.sendByUserCi === user?.ci;
          if (!user) {
            return (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>No se encontró el usuario autenticado.</Text>
              </View>
            );
          } else
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

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          borderTopWidth: 1,
          borderColor: "#ddd",
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
        <TouchableOpacity onPress={handleSend}>
          <Text style={{ color: "#4f46e5", fontWeight: "bold" }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

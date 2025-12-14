import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getChats, sendMessage } from "../../../services/chat";
import { useAuth } from "../../../contexts/AuthContext";
import { styles } from "../../../styles/styles";
import { colors } from "../../../styles/colors";

export default function NewChatScreen() {
  const router = useRouter();
  const { recipientCi } = useLocalSearchParams<{ recipientCi?: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // ─────────────────────────────────────
  // Al entrar: ver si el chat ya existe
  // ─────────────────────────────────────
  useEffect(() => {
    if (!recipientCi || !user?.ci) return;

    const checkExistingChat = async () => {
      try {
        setLoading(true);
        const chats = await getChats();

        const existing = chats.find(
          (c: any) =>
            c.participant1?.ci === recipientCi ||
            c.participant2?.ci === recipientCi
        );

        if (existing?.id) {
          router.replace({
            pathname: "/(main)/chats/[chatId]",
            params: { chatId: String(existing.id) },
          });
          return;
        }
      } catch (e) {
        console.error("[NewChat] Error checking chats:", e);
      } finally {
        setLoading(false);
      }
    };

    checkExistingChat();
  }, [recipientCi, router, user?.ci]);

  // ─────────────────────────────────────
  // Enviar primer mensaje → crea el chat
  // ─────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || !recipientCi) return;

    try {
      setSending(true);
      const data = await sendMessage(recipientCi, text.trim());

      if (!data?.chatId) {
        throw new Error("chatId no recibido");
      }

      router.replace({
        pathname: "/(main)/chats/[chatId]",
        params: { chatId: String(data.chatId) },
      });
    } catch (e) {
      console.error("[NewChat] Error sending first message:", e);
    } finally {
      setSending(false);
    }
  };

  // ─────────────────────────────────────
  // UI
  // ─────────────────────────────────────
  if (loading) {
    return (
      <View style={localStyles.center}>
        <ActivityIndicator size="large" color={colors.primary[60]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, localStyles.container]}>
      <Text style={localStyles.title}>Iniciar conversación</Text>

      <TextInput
        placeholder="Escribe tu mensaje..."
        value={text}
        onChangeText={setText}
        style={localStyles.input}
        multiline
      />

      <TouchableOpacity
        style={[
          styles.msgButton,
          (!text.trim() || sending) && { opacity: 0.6 },
        ]}
        onPress={handleSend}
        disabled={!text.trim() || sending}
      >
        <Text style={styles.msgButtonText}>
          {sending ? "Enviando..." : "Enviar mensaje"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: colors.primary[70],
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: "top",
  },
});

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "../../styles/styles";
import { api } from "../../services/api";
import { colors } from "../../styles/colors";
import { getOrCreateChatWith } from "../../services/chat";
import { useAuth } from "../../contexts/AuthContext";

interface Participant {
  ci: string;
  name: string;
  email?: string | null;
  description?: string | null;
  pictureUrl?: string | null;
  role?: string | null;
}

export default function ParticipantsList() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!courseId) return;

    const fetchParticipants = async () => {
      setLoading(true);
      setError("");

      try {
        const base =
          typeof (api as any).getUri === "function"
            ? (api as any).getUri()
            : (api as any).getUri ?? (api as any).defaults?.baseURL ?? "";

        const url = `${base.replace(/\/+$/, "")}/courses/${encodeURIComponent(
          String(courseId)
        )}/participants`;

        const res = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        const text = await res.text();

        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        }

        const parsed = JSON.parse(text);
        const data = parsed?.data ?? [];

        if (!Array.isArray(data)) {
          throw new Error("Formato inesperado de respuesta (data no es array)");
        }

        const sorted = [...data].sort((a, b) =>
          a.role === "PROFESOR" && b.role !== "PROFESOR"
            ? -1
            : b.role === "PROFESOR" && a.role !== "PROFESOR"
            ? 1
            : 0
        );

        setParticipants(sorted as Participant[]);
      } catch (err: any) {
        console.error("[getParticipants] error:", err);
        setError(err?.message ?? "Error al obtener participantes");
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [courseId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return participants;

    return participants.filter(
      (p) =>
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.ci ?? "").toLowerCase().includes(q)
    );
  }, [participants, search]);

  const renderItem = ({ item }: { item: Participant }) => {
    const canChat = user?.ci !== item.ci;

    return (
      <View style={localStyles.itemCard}>
        <View style={localStyles.itemRow}>
          <Text style={localStyles.name}>{item.name}</Text>
          <Text style={localStyles.ci}>CI: {item.ci}</Text>
        </View>

        <Text style={localStyles.meta}>{item.email ?? ""}</Text>
        <Text style={localStyles.meta}>{item.description ?? ""}</Text>

        <View style={localStyles.actionsRow}>
          {/* 🔹 Ver perfil */}
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/(main)/profile/[ci]",
                params: { ci: item.ci },
              })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Ver Perfil</Text>
          </TouchableOpacity>

          {canChat && (
            <TouchableOpacity
              style={styles.msgButton}
              activeOpacity={0.8}
              onPress={async () => {
                try {
                  const chat = await getOrCreateChatWith(item.ci);
                  if (!chat?.id) {
                    Alert.alert("Error", "No se pudo iniciar el chat.");
                    return;
                  }

                  router.push({
                    pathname: "/(main)/chats/[partnerCi]",
                    params: {
                      partnerCi: item.ci,
                      chatId: String(chat.id),
                    },
                  });
                } catch {
                  Alert.alert("Error", "No se pudo iniciar el chat.");
                }
              }}
            >
              <Text style={styles.msgButtonText}>Mensajes</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  if (error) {
    return (
      <View style={localStyles.center}>
        <Text style={localStyles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, localStyles.container]}>
      <TextInput
        placeholder="Buscar por nombre o CI"
        value={search}
        onChangeText={setSearch}
        style={localStyles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.ci}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={localStyles.center}>
            <Text style={localStyles.emptyText}>
              No se encontraron participantes.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  searchInput: {
    height: 42,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: colors.primary[20],
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 1,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  name: {
    fontWeight: "700",
  },
  ci: {
    color: "#666",
  },
  meta: {
    color: "#444",
    marginTop: 2,
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  center: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
  },
  errorText: {
    color: "red",
  },
});

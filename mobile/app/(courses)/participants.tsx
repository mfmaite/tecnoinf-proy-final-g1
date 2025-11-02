import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { styles } from "../../styles/styles";
import { api } from "../../services/api";

const router = useRouter();
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

        setParticipants(data as Participant[]);
      } catch (err: any) {
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

  const renderItem = ({ item }: { item: Participant }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemRow}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.ci}>CI: {item.ci}</Text>
      </View>
      <Text style={styles.meta}>{item.email ?? ""}</Text>
      <Text style={styles.meta}>{item.description ?? ""}</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
            style={styles.button}
            onPress={() => router.push(
            {
              pathname: "/(courses)/viewProfile",
              params: {
                ci: item.ci,
                name: item.name,
                email: item.email,
                description: item.description,
                pictureUrl: item.pictureUrl,
                role: item.role,
              },
            })}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Ver Perfil</Text>
          </TouchableOpacity>
        {item.role === "PROFESOR" && (
          <TouchableOpacity
            style={styles.msgButton}
            onPress={() => Alert.alert("Mensajes", "Funcionalidad no implementada")}
            activeOpacity={0.8}
          >
            <Text style={styles.msgButtonText}>Mensajes</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.container]}>
      <TextInput
        placeholder="Buscar por nombre o CI"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.ci}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No se encontraron participantes.</Text>
          </View>
        }
      />
    </View>
  );
}

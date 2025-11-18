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
import { useLocalSearchParams } from "expo-router";
import { styles } from "../../../../styles/styles";
import {
  Participant,
  getCourseParticipants,
} from "../../../../services/courses";

export default function ParticipantsList() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const safeCourseId = String(courseId ?? "");

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!safeCourseId) return;

    let active = true;

    const load = async () => {
      try {
        const list = await getCourseParticipants(safeCourseId);
        if (active) setParticipants(list);
      } catch (err: any) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [safeCourseId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return participants;

    return participants.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.ci?.toLowerCase().includes(q)
    );
  }, [participants, search]);

  const renderItem = ({ item }: { item: Participant }) => (
    <View style={localStyles.itemCard}>
      <View style={localStyles.itemRow}>
        <Text style={localStyles.name}>{item.name}</Text>
        <Text style={localStyles.ci}>CI: {item.ci}</Text>
      </View>

      <Text style={localStyles.meta}>{item.email ?? ""}</Text>
      <Text style={localStyles.meta}>{item.description ?? ""}</Text>

      <View style={localStyles.actionsRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Alert.alert("Ver Perfil", "Funcionalidad no implementada")}
        >
          <Text style={styles.buttonText}>Ver Perfil</Text>
        </TouchableOpacity>

        {item.role === "PROFESOR" && (
          <TouchableOpacity
            style={styles.msgButton}
            onPress={() => Alert.alert("Mensajes", "Funcionalidad no implementada")}
          >
            <Text style={styles.msgButtonText}>Mensajes</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;

  if (error)
    return (
      <View style={localStyles.center}>
        <Text style={localStyles.errorText}>{error}</Text>
      </View>
    );

  return (
    <View style={[styles.container, localStyles.container]}>
      <TextInput
        placeholder="Buscar por nombre o CI"
        value={search}
        onChangeText={setSearch}
        style={localStyles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.ci}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={localStyles.center}>
            <Text style={localStyles.emptyText}>No se encontraron participantes.</Text>
          </View>
        }
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8 },
  searchInput: {
    height: 42,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 1,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  name: { fontWeight: "700" },
  ci: { color: "#666" },
  meta: { color: "#444", marginTop: 2 },
  actionsRow: { marginTop: 8, flexDirection: "row" },
  center: { padding: 20, alignItems: "center" },
  emptyText: { color: "#666" },
  errorText: { color: "red" },
});

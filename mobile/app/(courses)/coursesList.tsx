import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../styles/colors";
import { styles } from "../../styles/styles";
import { api } from "../../services/api";
import { Picker } from "@react-native-picker/picker";

interface Course {
  id: string;
  name?: string;
  createdDate?: string | null;
}

function formatDate(date?: string | null) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function CoursesList() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "name-asc" | "name-desc" | "fecha-asc" | "fecha-desc"
  >("name-asc");

  // ─────────────────────────────────────────────
  // 📌 Cargar cursos
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const resp = await api.get("/courses");
        const data = resp.data.data || [];
        setCourses(data);
        setFilteredCourses(data);
      } catch {
        setError("No se pudieron cargar los cursos.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // ─────────────────────────────────────────────
  // 🔍 Filtrar + Ordenar
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (courses.length === 0) return;
    let filtered = courses.filter(
      (c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
    );

    switch (sortOrder) {
      case "name-asc":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "fecha-asc":
        filtered.sort((a, b) =>
          (a.createdDate || "").localeCompare(b.createdDate || "")
        );
        break;
      case "fecha-desc":
        filtered.sort((a, b) =>
          (b.createdDate || "").localeCompare(a.createdDate || "")
        );
        break;
    }

    setFilteredCourses(filtered);
  }, [courses, search, sortOrder]);

  // ─────────────────────────────────────────────
  // 🎨 Render item
  // ─────────────────────────────────────────────
  const renderCourse = ({ item }: { item: Course }) => (
    <View style={styles.row}>
      <Text style={styles.cellId}>{item.id}</Text>
      <Text style={styles.cellName}>{item.name ?? "-"}</Text>
      <Text style={styles.cellDate}>{formatDate(item.createdDate)}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/(courses)/${item.id}`)}
      >
        <Text style={styles.buttonText}>Ver</Text>
      </TouchableOpacity>
    </View>
  );

  // ─────────────────────────────────────────────
  // ⏳ Loading & Error
  // ─────────────────────────────────────────────
  if (loading)
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary[60]} />
      </View>
    );

  if (error)
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );

  // ─────────────────────────────────────────────
  // 📄 UI
  // ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre o ID..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.sortContainerBox}>
        <Text style={styles.sortLabelBox}>Ordenar por:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={sortOrder}
            onValueChange={(v) => setSortOrder(v as any)}
            mode="dropdown"
          >
            <Picker.Item label="Nombre (A-Z)" value="name-asc" />
            <Picker.Item label="Nombre (Z-A)" value="name-desc" />
            <Picker.Item label="Fecha (Asc)" value="fecha-asc" />
            <Picker.Item label="Fecha (Desc)" value="fecha-desc" />
          </Picker>
        </View>
      </View>

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 1 }]}>ID</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Nombre</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Creado</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Acción</Text>
      </View>

      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={renderCourse}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

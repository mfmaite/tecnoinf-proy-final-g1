import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../../../styles/colors";
import { styles } from "../../../../styles/styles";
import { Picker } from "@react-native-picker/picker";
import { getCourses, CourseListItem } from "../../../../services/courses";

function formatDate(date?: string | null) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString("es-UY");
}

export default function CoursesList() {
  const router = useRouter();

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [sortOrder, setSortOrder] = useState<
    "name-asc" | "name-desc" | "fecha-asc" | "fecha-desc"
  >("name-asc");

  // ─────────────────────────────────────────────
  // 📌 Traer lista de cursos del backend
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
        setFilteredCourses(data);
      } catch (err: any) {
        setError(err.message || "No se pudieron cargar los cursos.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  // ─────────────────────────────────────────────
  // 🔎 Filtrar + ordenar (con useCallback)
  // ─────────────────────────────────────────────
  const filterAndSort = useCallback(() => {
    let filtered = courses.filter(
      (c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toString().includes(search)
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

  useEffect(() => {
    if (courses.length > 0) {
      filterAndSort();
    }
  }, [courses, search, sortOrder, filterAndSort]);

  // ─────────────────────────────────────────────
  // 🎨 Render item
  // ─────────────────────────────────────────────
  const renderCourse = ({ item }: { item: CourseListItem }) => (
    <View style={styles.row}>
      <Text style={styles.cellId}>{item.id}</Text>
      <Text style={styles.cellName}>{item.name ?? "-"}</Text>
      <Text style={styles.cellDate}>{formatDate(item.createdDate)}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/(main)/(courses)/[courseId]",
            params: { courseId: item.id },
          })
        }
      >
        <Text style={styles.buttonText}>Ver</Text>
      </TouchableOpacity>
    </View>
  );

  // ─────────────────────────────────────────────
  // 🧭 UI principal
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary[60]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Búsqueda */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre o ID..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Ordenamiento */}
      <View style={styles.sortContainerBox}>
        <Text style={styles.sortLabelBox}>Ordenar por:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={sortOrder}
            onValueChange={(value) => setSortOrder(value as any)}
            mode="dropdown"
          >
            <Picker.Item label="Nombre (A-Z)" value="name-asc" />
            <Picker.Item label="Nombre (Z-A)" value="name-desc" />
            <Picker.Item label="Fecha (Asc)" value="fecha-asc" />
            <Picker.Item label="Fecha (Desc)" value="fecha-desc" />
          </Picker>
        </View>
      </View>

      {/* Tabla header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 1 }]}>ID</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Nombre</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Creado</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Acción</Text>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCourse}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

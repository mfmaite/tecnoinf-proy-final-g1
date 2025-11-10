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
import { Picker } from '@react-native-picker/picker';

interface Course {
  id?: string;
  name?: string;
  createdDate?: string;
}

function formatDate(date?: string | null) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function CoursesList() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"name-asc" | "name-desc" | "fecha-asc"| "fecha-desc"
  >(
    "name-asc"
  );

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      filterAndSort();
    }
  }, [courses, search, sortOrder]);


 const fetchCourses = async () => {
  try {
    const response = await api.get("/courses");
    const data = response.data.data || [];
    setCourses(data);
    setFilteredCourses(data);
  } catch {
    setError("No se pudieron cargar los cursos.");
  } finally {
    setLoading(false);
  }
};

  const filterAndSort = () => {
    let filtered = courses.filter(
      (c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.id?.toString().includes(search)
    );

    switch (sortOrder) {
      case "name-asc":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "fecha-asc":
        filtered.sort((a, b) => (a.createdDate || "").localeCompare(b.createdDate || ""));
        break;
      case "fecha-desc":
        filtered.sort((a, b) => (b.createdDate || "").localeCompare(a.createdDate || ""));
        break;
    }

    setFilteredCourses(filtered);
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <View style={styles.row}>
      <Text style={styles.cellId}>{item.id ?? "-"}</Text>
      <Text style={styles.cellName}>{item.name ?? "-"}</Text>
      <Text style={styles.cellDate}>{formatDate(item.createdDate) ?? "-"}</Text>
      <TouchableOpacity
        style={styles.button} onPress={() => router.push(`/(courses)/${item.id}`)}
        >
        <Text style={styles.buttonText}>Ver</Text>
      </TouchableOpacity>
    </View>
  );

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
      {/* Campo de búsqueda */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre o ID..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Selector de ordenamiento (combo) */}
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
      {/* Selector de filtro (combo) */}
      <View style={styles.sortContainerBox}>
        <Text style={styles.sortLabelBox}>Filtrar por:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={sortOrder}
            onValueChange={(value) => setSortOrder(value as any)}
            mode="dropdown"
          >
            <Picker.Item label="Todos" value="todo" />
            <Picker.Item label="Finalizado" value="fin" />
            <Picker.Item label="En curso" value="nofin" />
          </Picker>
        </View>
      </View>

      {/* Cabecera de columnas */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 1 }]}>ID</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Nombre</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Creado</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Acción</Text>
      </View>

      {/* Lista de cursos */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        renderItem={renderCourse}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

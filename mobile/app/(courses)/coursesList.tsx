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
//import { CourseView } from "/courseView";

const router = useRouter();

function openCourse(id: string, name: string) {
  router.push({
    pathname: "/(courses)/[courseId]",
    params: { courseId: String(id), courseName: String(name) },
  });
}
interface Course {
  id?: string;
  name?: string;
  createdDate?: string;
}


export default function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"name-asc" | "name-desc" | "id-asc" | "id-desc">(
    "name-asc"
  );
  const router = useRouter();

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
    //grabo respuesta
    console.log("Respuesta del backend:", response.data);
    // inicializamos filteredCourses
    setFilteredCourses(data);
  } catch (err) {
    console.error("Error al obtener cursos:", err);
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
      case "id-asc":
        filtered.sort((a, b) => (a.id || "").localeCompare(b.id || ""));
        break;
      case "id-desc":
        filtered.sort((a, b) => (b.id || "").localeCompare(a.id || ""));
        break;
    }

    setFilteredCourses(filtered);
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <View style={styles.row}>
      <Text style={styles.cellId}>{item.id ?? "-"}</Text>
      <Text style={styles.cellName}>{item.name ?? "-"}</Text>
      <Text style={styles.cellDate}>{item.createdDate ?? "-"}</Text>
      <TouchableOpacity
        style={styles.button} onPress={() => router.push(`/(courses)/${item.id}`)} 
        //onPress={() => console.log(`Ver curso ${item.id}`)} // luego -> router.push(`/courses/${item.id}`)
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

      {/* Selector de ordenamiento */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        {["name-asc", "name-desc", "id-asc", "id-desc"].map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setSortOrder(option as any)}
            style={[
              styles.sortButton,
              sortOrder === option && styles.sortButtonActive,
            ]}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortOrder === option && styles.sortButtonTextActive,
              ]}
            >
              {option === "name-asc"
                ? "Nombre (A-Z)"
                : option === "name-desc"
                ? "Nombre (Z-A)"
                : option === "id-asc"
                ? "ID (A-Z)"
                : "ID (Z-A)"}
            </Text>
          </TouchableOpacity>
        ))}
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



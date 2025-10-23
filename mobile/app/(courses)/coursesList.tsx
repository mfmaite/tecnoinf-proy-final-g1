import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../styles/colors";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

interface Course {
  id: number;
  name: string;
}

export default function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      setCourses(response.data.data || []);
    } catch (err) {
      console.error("Error al obtener cursos:", err);
      setError("No se pudieron cargar los cursos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const renderCourse = ({ item }: { item: Course }) => (
    <View style={styles.courseCard}>
      <Text style={styles.courseName}>{item.name}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log(`Ver curso ${item.id}`)} // futuro router.push(`/courses/${item.id}`)
      >
        <Text style={styles.buttonText}>Ver curso</Text>
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
      <Text style={styles.title}>Listado de cursos</Text>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCourse}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceLight[20],
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.secondary[60],
    marginBottom: 20,
  },
  listContainer: {
    width: "90%",
    paddingBottom: 20,
  },
  courseCard: {
    backgroundColor: colors.surfaceLight[10],
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  courseName: {
    fontSize: 18,
    color: colors.textNeutral[50],
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary[60],
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: colors.surfaceLight[10],
    fontWeight: "600",
  },
  error: {
    color: colors.accent.danger[40],
    textAlign: "center",
    fontSize: 16,
  },
});

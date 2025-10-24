import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useRouter,useLocalSearchParams } from "expo-router";
import { colors } from "../../styles/colors";
import { getCourseById, CourseData, Content } from "../../services/courses";
import { styles } from "../../styles/styles";
import { useNavigation } from "@react-navigation/native";

export default function CourseView() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId?: string }>(); // <-- usar params
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    if (!courseId) return; // espera hasta que esté disponible
    //console.log("Cargando curso con ID:", courseId);
    const fetchCourse = async () => {
      //console.log("fetchCourse llamado con courseId:", courseId);
      try {
        //console.log("Antes de llamar a getCourseById con ID:", courseId);
        const data = await getCourseById(String(courseId));
        setCourseData(data.course);
        //console.log("Datos del curso:", data);
        setContents((data.contents || []).sort((a, b) => a.id - b.id));
        
      } catch (err) {
        setError("No se pudieron cargar los datos del curso.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]); // <-- depende de courseId
  useLayoutEffect(() => {
  if (courseData?.name) {
    (navigation as any).setOptions?.({ title: courseData.name });
  }
  }, [navigation, courseData?.name]);

  if (loading) return <ActivityIndicator size="large" color={colors.primary[60]} style={styles.loader} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!courseData) return <Text style={styles.error}>Curso no encontrado.</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        
        <Text style={styles.subtitle}>ID: {courseData.id},
          Creado:{" "}
          {courseData.createdDate
            ? new Date(courseData.createdDate).toLocaleDateString("es-ES")
            : ""}
        </Text>
      </View>

      <Text style={styles.title}>Contenidos</Text>
      {contents.map((item) => (
        <View key={item.id} style={styles.contentCard}>
          <Text style={styles.subtitle}>{item.title || ""}</Text>
          <Text style={styles.contentText}>{item.content || ""}</Text>
          {item.fileName && item.fileUrl && (
            <Text style={styles.contentFile}>
              Archivo: {item.fileName} ({item.fileUrl})
            </Text>
          )}
          <Text style={styles.contentDate}>
            Creado:{" "}
            {item.createdDate
              ? new Date(item.createdDate).toLocaleDateString("es-ES")
              : ""}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}


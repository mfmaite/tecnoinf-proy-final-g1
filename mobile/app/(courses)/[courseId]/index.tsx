import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { colors } from "../../../styles/colors";
import { styles } from "../../../styles/styles";

// 👇 IMPORT CORRECTO — SOLO DESDE courses.ts
import {
  getCourseById,
  type CourseData,
  type ContentListItem,
} from "../../../services/courses";

export default function CourseView() {
  const router = useRouter();
  const navigation = useNavigation();
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [contents, setContents] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 📌 Cargar curso y contenidos
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const data = await getCourseById(courseId);
        setCourseData(data.course);
        setContents([...data.contents].sort((a, b) => a.id - b.id));
      } catch (err: any) {
        console.error("[CourseView] Error:", err);
        setError(err.message || "No se pudieron cargar los datos del curso.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // 🔁 Título dinámico
  useLayoutEffect(() => {
    if (courseData)
      (navigation as any).setOptions?.({ title: courseData.name ?? "Curso" });
  }, [courseData, navigation]);

  // 📎 Descargar archivo
  async function handleDownload(url?: string | null, fileName?: string | null) {
    if (!url) return Alert.alert("Archivo no disponible");

    try {
      const name = fileName || url.split("/").pop() || `archivo_${Date.now()}`;
      const destination = new Directory(Paths.document, name);
      await destination.create();
      const file = await File.downloadFileAsync(url, destination);
      const uri = file.uri;

      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
      else await Linking.openURL(uri);
    } catch {
      Alert.alert("No se pudo abrir el archivo.");
    }
  }

  // 🔗 Texto con enlaces clicables
  function renderContentWithLinks(content?: string | null) {
    if (!content) return null;

    return (
      <Text style={styles.contentText}>
        {content.split(/(https?:\/\/[^\s]+)/g).map((part, idx) =>
          part.startsWith("http") ? (
            <Text
              key={idx}
              style={styles.link}
              onPress={() => Linking.openURL(part)}
            >
              {part}
            </Text>
          ) : (
            <Text key={idx}>{part}</Text>
          )
        )}
      </Text>
    );
  }

  // 🎨 RENDERIZADORES
  function renderSimple(item: ContentListItem) {
    return (
      <View
        key={item.id}
        style={[styles.contentCard, { borderLeftWidth: 4, borderLeftColor: "#22C55E" }]}
      >
        <Text style={styles.subtitle}>📄 {item.title}</Text>
      </View>
    );
  }

  function renderEvaluation(item: ContentListItem) {
    return (
      <View
        key={item.id}
        style={[styles.contentCard, { borderLeftWidth: 4, borderLeftColor: "#F97316" }]}
      >
        <Text style={styles.subtitle}>📝 Evaluación: {item.title}</Text>

        {item.dueDate && (
          <Text style={styles.contentDate}>
            Límite: {new Date(item.dueDate).toLocaleDateString("es-ES")}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.buttonPrimary, { marginTop: 10 }]}
          onPress={() =>
            router.push({
              pathname: "/submit-evaluation",
              params: { courseId: String(courseId), contentId: String(item.id) },
            })
          }
        >
          <Text style={styles.buttonText}>Entregar evaluación</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderQuiz(item: ContentListItem) {
    return (
      <View
        key={item.id}
        style={[styles.contentCard, { borderLeftWidth: 4, borderLeftColor: "#3B82F6" }]}
      >
        <Text style={styles.subtitle}>📘 Quiz: {item.title}</Text>

        <TouchableOpacity
          style={[styles.buttonPrimary, { marginTop: 10 }]}
          onPress={() =>
            router.push({
              pathname: "/quiz",
              params: { courseId: String(courseId), contentId: String(item.id) },
            })
          }
        >
          <Text style={styles.buttonText}>Responder quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ⏳ ESTADOS
  if (loading)
    return <ActivityIndicator size="large" color={colors.primary[60]} style={styles.loader} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!courseData) return <Text style={styles.error}>Curso no encontrado.</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Contenidos</Text>

      {contents.length ? (
        contents.map((item) => {
          switch (item.type) {
            case "simpleContent":
              return renderSimple(item);
            case "evaluation":
              return renderEvaluation(item);
            case "quiz":
              return renderQuiz(item);
            default:
              return null;
          }
        })
      ) : (
        <Text style={styles.emptyText}>No hay contenidos disponibles.</Text>
      )}
    </ScrollView>
  );
}

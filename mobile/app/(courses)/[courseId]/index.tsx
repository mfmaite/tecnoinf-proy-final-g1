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
import { getCourseById, CourseData, Content } from "../../../services/courses";

export default function CourseView() {
  const router = useRouter();
  const navigation = useNavigation();
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // 📚 Cargar curso
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const data = await getCourseById(courseId);
        setCourseData(data.course);
        setContents((data.contents || []).sort((a, b) => a.id - b.id));
      } catch (err: any) {
        console.error("[CourseView] Error al cargar curso:", err.response?.data || err);
         setError(err.message || "No se pudieron cargar los datos del curso.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // ─────────────────────────────────────────────
  // 🧭 Actualizar título dinámico
  // ─────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!courseData) return; // ✅ si no hay datos, salimos temprano
    (navigation as any).setOptions?.({ title: courseData.name ?? "Curso" });
  }, [courseData, navigation]);

  // ─────────────────────────────────────────────
  // 📎 Descarga y apertura de archivos
  // ─────────────────────────────────────────────
  async function handleDownload(url?: string | null, fileName?: string | null) {
    if (!url) {
      Alert.alert("Archivo no disponible");
      return;
    }

    try {
      const name = fileName || url.split("/").pop() || `archivo_${Date.now()}`;
      const destination = new Directory(Paths.document, name); // carpeta principal + nombre
      await destination.create(); // asegúrate que exista

      const file = await File.downloadFileAsync(url, destination);
      // file es instancia de File, tiene .uri entre otras props

      const uri = file.uri;

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        await Linking.openURL(uri);
      }
    } catch (err) {
      console.warn("[handleDownload] Error al descargar:", err);
      try {
        if (url) await Linking.openURL(url);
      } catch {
        Alert.alert("No se puede abrir el archivo.");
      }
    }
  }
  // ─────────────────────────────────────────────
  // 🔗 Render de texto con enlaces clicables
  // ─────────────────────────────────────────────
  function renderContentWithLinks(content?: string | null) {
    if (!content) return null;

    const parts = content.split(/(https?:\/\/[^\s]+)/g);

    return (
      <Text style={styles.contentText}>
        {parts.map((part, idx) => {
          if (!part) return null;
          const isUrl =
            part.startsWith("http://") || part.startsWith("https://");

          return isUrl ? (
            <Text
              key={idx}
              style={styles.link}
              onPress={async () => {
                try {
                  const supported = await Linking.canOpenURL(part);
                  if (supported) await Linking.openURL(part);
                  else Alert.alert("No se puede abrir el enlace.");
                } catch {
                  Alert.alert("Error al abrir el enlace.");
                }
              }}
            >
              {part}
            </Text>
          ) : (
            <Text key={idx}>{part}</Text>
          );
        })}
      </Text>
    );
  }

  // ─────────────────────────────────────────────
  // ⏳ Render principal
  // ─────────────────────────────────────────────
  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary[60]}
        style={styles.loader}
      />
    );

  if (error) return <Text style={styles.error}>{error}</Text>;

  if (!courseData)
    return <Text style={styles.error}>Curso no encontrado.</Text>;

  // ─────────────────────────────────────────────
  // 🎨 Render UI
  // ─────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* 🔹 Botón de participantes */}
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() =>
          router.push({
            pathname: "/(courses)/participants",
            params: { courseId: String(courseId) },
          })
        }
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Ver Participantes</Text>
      </TouchableOpacity>

      {/* 🧾 Encabezado */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          ID: {courseData.id}
          {"\n"}
          Creado:{" "}
          {courseData.createdDate
            ? new Date(courseData.createdDate).toLocaleDateString("es-ES")
            : "—"}
        </Text>
      </View>

      {/* 📘 Contenidos */}
      <Text style={styles.title}>Contenidos</Text>
      {contents.length ? (
        contents.map((item) => (
          <View key={item.id} style={styles.contentCard}>
            <Text style={styles.subtitle}>{item.title || "Sin título"}</Text>
            {renderContentWithLinks(item.content)}

            {item.fileName && item.fileUrl && (
              <View>
                <Text style={styles.contentFile}>Archivo: {item.fileName}</Text>
                <TouchableOpacity
                  style={styles.buttonPrimary}
                  onPress={() => handleDownload(item.fileUrl, item.fileName)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Descargar</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.contentDate}>
              Creado:{" "}
              {item.createdDate
                ? new Date(item.createdDate).toLocaleDateString("es-ES")
                : "—"}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No hay contenidos disponibles.</Text>
      )}

      {/* 💬 Foros */}
      <Text style={styles.title}>Foros</Text>
      {courseData.forums?.length ? (
        courseData.forums.map((forum) => (
          <TouchableOpacity
            key={forum.id}
            style={[styles.contentCard, { marginBottom: 12 }]}
            onPress={() =>
              router.push({
                pathname: "/[courseId]/forums/[forumId]",
                params: {
                  courseId: String(courseData.id),
                  forumId: String(forum.id),
                },
              })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.subtitle}>
              {forum.type === "ANNOUNCEMENTS"
                ? "Foro de Anuncios"
                : "Foro de Consultas"}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyText}>No hay foros disponibles.</Text>
      )}
    </ScrollView>
  );
}

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
    if (!courseData) return;
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
      const destination = new Directory(Paths.document, name);
      await destination.create();
      const file = await File.downloadFileAsync(url, destination);
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
          const isUrl = part.startsWith("http://") || part.startsWith("https://");

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
  // 🎨 RENDER SIMPLE CONTENT
  // ─────────────────────────────────────────────
  function renderSimple(item: Content) {
    return (
      <View key={item.id} style={styles.contentCard}>
        <Text style={styles.subtitle}>{item.title || "Sin título"}</Text>
        {renderContentWithLinks(item.content)}

        {item.fileName && item.fileUrl && (
          <>
            <Text style={styles.contentFile}>Archivo: {item.fileName}</Text>

            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => handleDownload(item.fileUrl!, item.fileName!)}
            >
              <Text style={styles.buttonText}>Descargar</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.contentDate}>
          Creado:{" "}
          {item.createdDate
            ? new Date(item.createdDate).toLocaleDateString("es-ES")
            : "—"}
        </Text>
      </View>
    );
  }

  // ─────────────────────────────────────────────
  // 🎨 RENDER EVALUATION (tarea)
  // ─────────────────────────────────────────────
  function renderEvaluation(item: Content) {
    return (
      <View
        key={item.id}
        style={[
          styles.contentCard,
          { borderLeftWidth: 4, borderLeftColor: colors.primary[60] },
        ]}
      >
        <Text style={styles.subtitle}>📝 Evaluación: {item.title}</Text>

        {item.content && renderContentWithLinks(item.content)}

        {item.dueDate && (
          <Text style={styles.contentDate}>
            Fecha límite:{" "}
            {new Date(item.dueDate).toLocaleDateString("es-ES")}
          </Text>
        )}

        {item.fileName && item.fileUrl && (
          <>
            <Text style={styles.contentFile}>Archivo: {item.fileName}</Text>

            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => handleDownload(item.fileUrl!, item.fileName!)}
            >
              <Text style={styles.buttonText}>Descargar archivo</Text>
            </TouchableOpacity>
          </>
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

  // ─────────────────────────────────────────────
  // 🎨 RENDER QUIZ
  // ─────────────────────────────────────────────
  function renderQuiz(item: Content) {
    return (
      <View
        key={item.id}
        style={[
          styles.contentCard,
          { borderLeftWidth: 4, borderLeftColor: "#3B82F6" },
        ]}
      >
        <Text style={styles.subtitle}>📘 Quiz: {item.title}</Text>

        {item.dueDate && (
          <Text style={styles.contentDate}>
            Fecha límite:{" "}
            {new Date(item.dueDate).toLocaleDateString("es-ES")}
          </Text>
        )}

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
  // 🎨 Render UI final
  // ─────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Participantes */}
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() =>
          router.push({
            pathname: "/(courses)/participants",
            params: { courseId: String(courseId) },
          })
        }
      >
        <Text style={styles.buttonText}>Ver Participantes</Text>
      </TouchableOpacity>

      {/* Encabezado */}
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

      {/* CONTENIDOS */}
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
              return renderSimple(item);
          }
        })
      ) : (
        <Text style={styles.emptyText}>No hay contenidos disponibles.</Text>
      )}

      {/* FOROS */}
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

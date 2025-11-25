import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { api } from "../../services/api"; // USA TU API CONFIGURADA
import { colors } from "../../styles/colors";
import { styles } from "../../styles/styles";
import { getCourseById, Content } from "../../services/courses";

export default function SubmitEvaluation() {
  const router = useRouter();
  const { courseId, contentId } = useLocalSearchParams<{
    courseId?: string;
    contentId?: string;
  }>();

  const [contentData, setContentData] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [text, setText] = useState("");
  const [file, setFile] = useState<{
    name: string;
    uri: string;
    mimeType: string;
  } | null>(null);

  // ─────────────────────────────────────────────
  // 📚 Cargar datos del contenido (evaluación)
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!courseId || !contentId) return;

    const fetchData = async () => {
      try {
        const data = await getCourseById(courseId);

        const evaluation = data.contents.find(
          (c) => String(c.id) === String(contentId)
        );

        if (!evaluation) {
          Alert.alert("Error", "No se encontró la evaluación.");
          return;
        }

        setContentData(evaluation);
      } catch (err) {
        Alert.alert("Error", "No se pudo cargar la evaluación.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, contentId]);

  // ─────────────────────────────────────────────
  // 📁 Seleccionar archivo
  // ─────────────────────────────────────────────
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });

      if (result.canceled) return;

      const doc = result.assets[0];

      setFile({
        uri: doc.uri,
        name: doc.name || "archivo",
        mimeType: doc.mimeType || "application/octet-stream",
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar el archivo.");
    }
  };

  // ─────────────────────────────────────────────
  // 📤 Enviar evaluación
  // ─────────────────────────────────────────────
  const submitEvaluation = async () => {
    if (!courseId || !contentId) return;

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("text", text);

      if (file) {
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        } as any);
      }

      const response = await api.post(
        `/courses/${courseId}/contents/evaluation/${contentId}/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Éxito", "Tu evaluación fue enviada correctamente.");
      router.back(); // volver al curso
    } catch (error: any) {
      console.error("Error enviando evaluación:", error.response?.data || error);
      Alert.alert("Error", "No se pudo enviar la evaluación.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // ⏳ Loading
  // ─────────────────────────────────────────────
  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary[60]}
        style={styles.loader}
      />
    );

  if (!contentData)
    return <Text style={styles.error}>Evaluación no encontrada.</Text>;

  // ─────────────────────────────────────────────
  // 🎨 UI
  // ─────────────────────────────────────────────
  return (
    <View style={[styles.container, { padding: 20 }]}>
      <Text style={styles.title}>Entregar Evaluación</Text>
      <Text style={styles.subtitle}>{contentData.title}</Text>

      {contentData.dueDate && (
        <Text style={{ marginVertical: 10 }}>
          Fecha límite:{" "}
          {new Date(contentData.dueDate).toLocaleDateString("es-ES")}
        </Text>
      )}

      <Text style={styles.subtitle}>Mensaje (opcional)</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={4}
        style={[
          styles.input,
          { height: 100, textAlignVertical: "top", marginBottom: 20 },
        ]}
        placeholder="Escribe un comentario para la entrega..."
      />

      <Text style={styles.subtitle}>Archivo (opcional)</Text>

      {file ? (
        <View style={{ marginBottom: 10 }}>
          <Text style={{ marginBottom: 5 }}>📄 {file.name}</Text>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => setFile(null)}
          >
            <Text style={styles.buttonText}>Quitar archivo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.buttonPrimary} onPress={pickFile}>
          <Text style={styles.buttonText}>Seleccionar archivo</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.buttonPrimary,
          { marginTop: 30, opacity: submitting ? 0.6 : 1 },
        ]}
        onPress={submitEvaluation}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enviar Evaluación</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

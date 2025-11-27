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
import { colors } from "../../styles/colors";
import { styles } from "../../styles/styles";
import { getContentByType } from "../../services/content";
import { submitEvaluation } from "../../services/evaluation";
import { useAuth } from "../../contexts/AuthContext";

export default function SubmitEvaluation() {
  const router = useRouter();
  const { user } = useAuth(); // si necesitás token, agregalo aquí
  const { courseId, contentId } = useLocalSearchParams<{
    courseId?: string;
    contentId?: string;
  }>();

  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [solution, setSolution] = useState("");
  const [file, setFile] = useState<{ uri: string; name: string; mimeType: string } | null>(null);

  // ─────────────────────────────────────────────
  // 📚 Cargar datos de la evaluación desde content
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!courseId || !contentId) return;

    const load = async () => {
      try {
        const resp = await getContentByType(
          String(courseId),
          "evaluation",
          String(contentId)
        );

        // backend devuelve: { evaluation, submissions }
        if ("evaluation" in resp) setEvaluation(resp.evaluation);
        else setEvaluation(resp); // fallback defensivo (no debería pasar)

      } catch (err) {
        Alert.alert("Error", "No se pudo cargar la evaluación.");
      } finally {
        setLoading(false);
      }
    };


    load();
  }, [courseId, contentId]);

  // ─────────────────────────────────────────────
  // 📁 Seleccionar archivo
  // ─────────────────────────────────────────────
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result.canceled) return;

      const doc = result.assets[0];
      setFile({
        uri: doc.uri,
        name: doc.name ?? "archivo",
        mimeType: doc.mimeType ?? "application/octet-stream",
      });
    } catch {
      Alert.alert("Error", "No se pudo seleccionar archivo.");
    }
  };

  // ─────────────────────────────────────────────
  // 📤 Enviar respuesta
  // ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!evaluation) return;
    setSubmitting(true);

    try {
      const formData = new FormData();

      if (solution.trim().length > 0) {
        formData.append("solution", solution);
      }

      if (file) {
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        } as any);
      }

      await submitEvaluation(evaluation.id, formData);

      Alert.alert("Éxito", "Tu entrega fue enviada correctamente.");
      router.back();
    } catch (e: any) {
      console.error("Error al enviar:", e);
      Alert.alert("Error", e.message ?? "No se pudo enviar la evaluación.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // 🕑 Loading
  // ─────────────────────────────────────────────
  if (loading)
    return <ActivityIndicator color={colors.primary[60]} size="large" style={styles.loader} />;

  if (!evaluation)
    return <Text style={styles.error}>Evaluación no encontrada.</Text>;

  // ─────────────────────────────────────────────
  // 🎨 UI
  // ─────────────────────────────────────────────
  return (
    <View style={[styles.container, { padding: 20 }]}>
      <Text style={styles.title}>Entregar Evaluación</Text>
      <Text style={styles.subtitle}>{evaluation.title}</Text>

      {evaluation.dueDate && (
        <Text style={{ marginVertical: 10 }}>
          Fecha límite: {new Date(evaluation.dueDate).toLocaleDateString("es-ES")}
        </Text>
      )}

      <Text style={styles.subtitle}>Mensaje (opcional)</Text>
      <TextInput
        placeholder="Escribe un comentario..."
        value={solution}
        onChangeText={setSolution}
        multiline
        numberOfLines={4}
        style={[styles.input, { height: 100, textAlignVertical: "top", marginBottom: 20 }]}
      />

      <Text style={styles.subtitle}>Archivo (opcional)</Text>
      {file ? (
        <>
          <Text style={{ marginBottom: 6 }}>📄 {file.name}</Text>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => setFile(null)}>
            <Text style={styles.buttonText}>Quitar archivo</Text>
          </TouchableOpacity>
        </>
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
        disabled={submitting}
        onPress={handleSubmit}
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

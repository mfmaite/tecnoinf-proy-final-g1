import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { styles } from "../../../../styles/styles";
import { getContentByType, Content } from "../../../../services/courses";
import { MarkdownText } from "../../../../components/ui/MarkdownText";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

export const screenOptions = {
  title: "Evaluación",
  headerShown: true,
};

export default function EvaluationDetail() {
  const { courseId, evaluationId } = useLocalSearchParams<{ courseId?: string; evaluationId?: string }>();
  const [item, setItem] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!courseId || !evaluationId) return;
        const data = await getContentByType(String(courseId), "evaluation", String(evaluationId));
        const ev = (data && (data.evaluation || data)) as Content | undefined;
        if (ev) setItem(ev);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, evaluationId]);

  if (loading) return <View style={styles.loader} />;
  if (!item) return <Text style={styles.error}>Evaluación no encontrada.</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentCard}>
        <Text style={[styles.name, { marginBottom: 6 }]}>{item.title || "Evaluación"}</Text>

        {item?.dueDate ? (
          <View style={styles.chipRow}>
            <View style={[styles.chip]}>
              <Text style={styles.chipText}>Evaluación</Text>
            </View>
            <View style={[styles.chip, styles.chipMuted]}>
              <Text style={styles.chipMutedText}>
                Vence: {new Date(item.dueDate).toLocaleDateString("es-ES")}
              </Text>
            </View>
          </View>
        ) : null}

        {item.content ? <View style={{ marginTop: 10 }}><MarkdownText text={item.content} /></View> : null}
        {item.fileUrl && item.fileName ? (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.contentFile}>Archivo: {item.fileName}</Text>
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={async () => {
                try {
                  const dest = new Directory(Paths.document, item.fileName || `archivo_${Date.now()}`);
                  await dest.create();
                  const file = await File.downloadFileAsync(item.fileUrl!, dest);
                  const uri = file.uri;
                  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
                  else await Linking.openURL(uri);
                } catch (err) {
                  console.warn("[eval download] error", err);
                  try {
                    if (item.fileUrl) await Linking.openURL(item.fileUrl);
                  } catch {
                    Alert.alert("No se puede abrir el archivo.");
                  }
                }
              }}
            >
              <Text style={styles.buttonText}>Descargar</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={{ marginTop: 12 }}>
          <Text style={styles.meta}>Próximamente: enviar entrega y ver nota.</Text>
        </View>
      </View>
    </ScrollView>
  );
}



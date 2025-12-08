import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Linking, Alert, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { styles } from "../../../../styles/styles";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getContentByType, Content } from "../../../../services/courses";
import { MarkdownText } from "../../../../components/ui/MarkdownText";

export const screenOptions = {
  title: "Contenido Simple",
  headerShown: true,
};

export default function SimpleContentDetail() {
  const { courseId, contentId } = useLocalSearchParams<{ courseId?: string; contentId?: string }>();
  const [item, setItem] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  const typeLabel = useMemo(() => {
    if (!item?.type) return "Contenido";
    return item.type === "evaluation" ? "Evaluación" : item.type === "quiz" ? "Quiz" : "Contenido";
  }, [item?.type]);

  useEffect(() => {
    (async () => {
      try {
        if (!courseId || !contentId) return;
        const content = await getContentByType(String(courseId), "simpleContent", String(contentId));
        setItem(content);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, contentId]);

  async function handleDownload(url?: string | null, fileName?: string | null) {
    if (!url) return;
    try {
      const name = fileName || url.split("/").pop() || `archivo_${Date.now()}`;
      const destination = new Directory(Paths.document, name);
      await destination.create();
      const file = await File.downloadFileAsync(url, destination);
      const uri = file.uri;
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
      else await Linking.openURL(uri);
    } catch (err) {
      console.warn("[download] error", err);
      try {
        if (url) await Linking.openURL(url);
      } catch {
        Alert.alert("No se puede abrir el archivo.");
      }
    }
  }

  if (loading) return <ActivityIndicator style={styles.loader} />;
  if (!item) return <Text style={styles.error}>Contenido no encontrado.</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentCard}>
        <Text style={[styles.name, { marginBottom: 6 }]}>{item.title || "Contenido"}</Text>
        <View style={styles.chipRow}>
          <View style={[styles.chip]}>
            <Text style={styles.chipText}>{typeLabel}</Text>
          </View>
          {item?.dueDate ? (
            <View style={[styles.chip, styles.chipMuted]}>
              <Text style={styles.chipMutedText}>
                Vence: {new Date(item.dueDate).toLocaleDateString("es-ES")}
              </Text>
            </View>
          ) : null}
        </View>
        {item.content ? <View style={{ marginTop: 10 }}><MarkdownText text={item.content} /></View> : null}
        {item.fileUrl && item.fileName ? (
          <View>
            <Text style={styles.contentFile}>Archivo: {item.fileName}</Text>
            <TouchableOpacity style={styles.buttonPrimary} onPress={() => handleDownload(item.fileUrl, item.fileName)}>
              <Text style={styles.buttonText}>Descargar</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}



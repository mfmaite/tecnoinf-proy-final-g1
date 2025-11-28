import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getContentByType, SimpleContent } from "../../services/content";
import { styles } from "../../styles/styles";
import { colors } from "../../styles/colors";

export default function SimpleContentPage() {
  const router = useRouter();
  const { courseId, contentId } = useLocalSearchParams<{ courseId?: string; contentId?: string }>();

  const [content, setContent] = useState<SimpleContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId || !contentId) return;
    const load = async () => {
      try {
        const data = await getContentByType(courseId, "simpleContent", contentId);
        setContent(data as SimpleContent);
      } catch {
        alert("No se pudo cargar el contenido");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, contentId]);

  function openLinks(text: string) {
    const parts = text.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, idx) =>
      part.startsWith("http") ? (
        <Text
          key={idx}
          style={{ color: colors.primary[60], textDecorationLine: "underline" }}
          onPress={() => Linking.openURL(part)}
        >
          {part}
        </Text>
      ) : (
        <Text key={idx}>{part}</Text>
      )
    );
  }

  if (loading)
    return <ActivityIndicator style={styles.loader} size="large" color={colors.primary[60]} />;

  if (!content)
    return <Text style={styles.error}>Contenido no encontrado.</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={[styles.title, { color: "#16A34A" }]}>
        📗 {content.title}
      </Text>

      <View style={[styles.contentCard, { borderLeftColor: "#16A34A", borderLeftWidth: 4 }]}>
        {content.content ? (
          <Text style={styles.contentText}>{openLinks(content.content)}</Text>
        ) : (
          <Text style={styles.emptyText}>Contenido vacío</Text>
        )}

        {content.fileUrl && (
          <TouchableOpacity
            style={[styles.buttonPrimary, { marginTop: 10 }]}
            onPress={() => Linking.openURL(content.fileUrl!)}
          >
            <Text style={styles.buttonText}>Ver archivo adjunto</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

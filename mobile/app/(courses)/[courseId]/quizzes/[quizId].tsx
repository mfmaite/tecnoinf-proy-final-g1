import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { styles } from "../../../../styles/styles";
import { getContentByType, Content } from "../../../../services/courses";

export const screenOptions = {
  title: "Quiz",
  headerShown: true,
};

export default function QuizDetail() {
  const { courseId, quizId } = useLocalSearchParams<{ courseId?: string; quizId?: string }>();
  const [item, setItem] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!courseId || !quizId) return;
        const data = await getContentByType(String(courseId), "quiz", String(quizId));
        const qz = (data && (data.quiz || data)) as Content | undefined;
        if (qz) setItem(qz);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, quizId]);

  if (loading) return <View style={styles.loader} />;
  if (!item) return <Text style={styles.error}>Quiz no encontrado.</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentCard}>
        <Text style={[styles.name, { marginBottom: 6 }]}>{item.title || "Quiz"}</Text>
        <View style={styles.chipRow}>
          <View style={[styles.chip]}>
            <Text style={styles.chipText}>Quiz</Text>
          </View>
          {item?.dueDate ? (
            <View style={[styles.chip, styles.chipMuted]}>
              <Text style={styles.chipMutedText}>
                Vence: {new Date(item.dueDate).toLocaleDateString("es-ES")}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={styles.meta}>Próximamente: completar quiz y ver nota.</Text>
        </View>
      </View>
    </ScrollView>
  );
}



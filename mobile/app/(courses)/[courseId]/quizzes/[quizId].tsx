import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { styles } from "../../../../styles/styles";
import { getContentByType, Content } from "../../../../services/courses";
import { createQuizSubmission, getMyQuizSubmission, QuizSubmission } from "../../../../services/quizzes";

export const screenOptions = {
  title: "Quiz",
  headerShown: true,
};

export default function QuizDetail() {
  const { courseId, quizId } = useLocalSearchParams<{ courseId?: string; quizId?: string }>();
  const [item, setItem] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<{ id: number; question: string; answers: { id: number; text: string; correct?: boolean }[] }[]>([]);
  const [selected, setSelected] = useState<Record<number, number | null>>({});
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!courseId || !quizId) return;
        const data: any = await getContentByType(String(courseId), "quiz", String(quizId));
        const qz = (data && (data.quiz || data)) as Content | undefined;
        if (qz) setItem(qz);
        if (data?.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
        try {
          const mine = await getMyQuizSubmission(String(quizId));
          if (mine) {
            setSubmission(mine);
            if (mine.answerIds?.length && data?.questions) {
              const pre: Record<number, number | null> = {};
              for (const q of data.questions) {
                const match = (q.answers || []).find((a: any) => mine.answerIds?.includes(a.id));
                pre[q.id] = match?.id ?? null;
              }
              setSelected(pre);
            }
          }
        } catch {}
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
          {item?.dueDate ? (() => {
            const overdue = new Date(item.dueDate) < new Date();
            return (
              <View style={[styles.chip, overdue ? styles.chipDanger : styles.chipMuted]}>
                <Text style={overdue ? styles.chipDangerText : styles.chipMutedText}>
                  Vence: {new Date(item.dueDate).toLocaleDateString("es-ES")}
                </Text>
              </View>
            );
          })() : null}
        </View>
        <View style={{ marginTop: 12, gap: 10 }}>
          {questions.length === 0 ? (
            <Text style={styles.meta}>Este quiz no tiene preguntas.</Text>
          ) : (
            questions.map((q, idx) => (
              <View key={q.id} style={{ gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontWeight: "700" }}>{idx + 1}.</Text>
                  <Text style={{ fontWeight: "700" }}>{q.question}</Text>
                </View>
                <View style={{ paddingLeft: 18, gap: 6 }}>
                  {q.answers.map((a) => {
                    const checked = selected[q.id] === a.id;
                    const disabled = !!submission;
                    return (
                      <TouchableOpacity
                        key={a.id}
                        onPress={() => {
                          if (disabled) return;
                          setSelected((prev) => ({ ...prev, [q.id]: a.id }));
                        }}
                        style={{ flexDirection: "row", alignItems: "center", gap: 8, opacity: disabled ? 0.7 : 1 }}
                        activeOpacity={0.7}
                      >
                        <View
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            borderWidth: 2,
                            borderColor: checked ? "#4f46e5" : "#9ca3af",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {checked ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#4f46e5" }} /> : null}
                        </View>
                        <Text>{a.text}</Text>
                        {submission && a.correct ? <Text style={{ color: "#059669" }}> (correcta)</Text> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}
          {!submission && !(item?.dueDate && new Date(item.dueDate) < new Date()) ? (
            <TouchableOpacity
              style={[styles.buttonPrimary, { alignSelf: "flex-start" }]}
              disabled={submitting || questions.length === 0}
              onPress={async () => {
                try {
                  const answers = Object.values(selected).filter((v): v is number => typeof v === "number");
                  if (answers.length === 0) {
                    Alert.alert("Seleccioná al menos una respuesta.");
                    return;
                  }
                  setSubmitting(true);
                  const created = await createQuizSubmission(String(quizId), answers);
                  setSubmission(created);
                  Alert.alert("Enviado", "Tu entrega fue enviada correctamente.");
                } catch (e: any) {
                  Alert.alert("Error", e?.message || "No se pudo enviar el quiz.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <Text style={styles.buttonText}>{submitting ? "Enviando..." : "Enviar"}</Text>
            </TouchableOpacity>
          ) : submission ? (
            <Text style={styles.meta}>Tu nota: {submission?.note ?? 0}</Text>
          ) : (
            <Text style={[styles.meta, { color: "#b91c1c" }]}>El quiz está vencido.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}



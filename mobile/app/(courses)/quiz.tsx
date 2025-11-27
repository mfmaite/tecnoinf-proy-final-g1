import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { styles } from "../../styles/styles";
import { getContentByType } from "../../services/content";

interface Answer {
  id: number;
  text: string;
  correct: boolean;
}

interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

export default function QuizPage() {
  const { courseId, contentId } = useLocalSearchParams<{
    courseId?: string;
    contentId?: string;
  }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [corrected, setCorrected] = useState(false);

  // ─────────────────────────────────────────────
  // 📌 Cargar el quiz desde el backend
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!courseId || !contentId) return;

    const fetchQuiz = async () => {
      try {
        const quiz: any = await getContentByType(
          String(courseId),
          "quiz",
          String(contentId)
        );

        if (!quiz || !quiz.questions) {
          Alert.alert("Error", "El quiz no tiene preguntas.");
          return;
        }

        setQuestions(quiz.questions);
      } catch (e: any) {
        Alert.alert("Error", e.message ?? "No se pudo cargar el quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId, contentId]);

  // ─────────────────────────────────────────────
  // 🎯 Seleccionar respuesta
  // ─────────────────────────────────────────────
  function selectAnswer(questionId: number, answerId: number) {
    if (corrected) return; // bloquear luego de corregir
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  }

  // ─────────────────────────────────────────────
  // ✔️ Corregir respuestas
  // ─────────────────────────────────────────────
  function handleCorrect() {
    const incomplete = questions.some((q) => !selectedAnswers[q.id]);
    if (incomplete) {
      Alert.alert("Faltan preguntas", "Debes responder todas antes de corregir.");
      return;
    }
    setCorrected(true);
  }

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Quiz</Text>

      {questions.map((q) => (
        <View key={q.id} style={[styles.contentCard, { marginVertical: 10 }]}>
          <Text style={styles.subtitle}>{q.question}</Text>

          {q.answers.map((a) => {
            const isSelected = selectedAnswers[q.id] === a.id;
            const isCorrect = corrected && a.correct;
            const isWrong = corrected && isSelected && !a.correct;

            return (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.7}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isCorrect
                    ? "green"
                    : isWrong
                    ? "red"
                    : colors.primary[60],
                  marginVertical: 5,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onPress={() => selectAnswer(q.id, a.id)}
              >
                <Text
                  style={{
                    color: isCorrect
                      ? "green"
                      : isWrong
                      ? "red"
                      : "black",
                  }}
                >
                  {a.text}
                </Text>

                {corrected && (
                  <Ionicons
                    name={
                      isCorrect
                        ? "checkmark-circle"
                        : isWrong
                        ? "close-circle"
                        : "ellipse-outline"
                    }
                    size={22}
                    color={isCorrect ? "green" : isWrong ? "red" : "black"}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {!corrected && (
        <TouchableOpacity
          style={[styles.buttonPrimary, { marginTop: 20 }]}
          onPress={handleCorrect}
        >
          <Text style={styles.buttonText}>Corregir</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

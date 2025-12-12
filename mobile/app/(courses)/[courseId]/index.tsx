import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../../styles/colors";
import { styles } from "../../../styles/styles";
import {
  getCourseById,
  CourseData,
  Content,
  getCourseParticipants,
} from "../../../services/courses";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../contexts/AuthContext";

type CourseParams = {
  courseId: string;
  courseName?: string;
};

export const screenOptions = ({
  route,
}: {
  route: { params?: CourseParams };
}): NativeStackNavigationOptions => ({
  title: route.params?.courseName ?? "Detalle del curso",
  headerShown: true,
});

export default function CourseView() {
  const router = useRouter();
  const navigation = useNavigation();
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const { user, isStudent } = useAuth();

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loadingGrade, setLoadingGrade] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const data = await getCourseById(courseId);
        setCourseData(data.course);
        setContents(data.contents || []);
      } catch (err: any) {
        console.error(
          "[CourseView] Error al cargar curso:",
          err.response?.data || err
        );
        setError(err.message || "No se pudieron cargar los datos del curso.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  useLayoutEffect(() => {
    if (!courseData) return;
    (navigation as any).setOptions?.({
      title: courseData.name ?? "Curso",
    });
  }, [courseData, navigation]);

  const handleShowFinalGrade = async () => {
    if (!courseId || !user?.ci || loadingGrade) return;

    setLoadingGrade(true);

    try {
      const participants = await getCourseParticipants(courseId);

      const me = participants.find((p) => p.ci === user.ci);

      if (!me) {
        Alert.alert(
          "Calificación final",
          "No se encontró tu registro en este curso."
        );
        return;
      }

      if (me.finalGrade === null || me.finalGrade === undefined) {
        Alert.alert(
          "Calificación final",
          "Aún no hay una calificación final disponible."
        );
        return;
      }

      Alert.alert("Calificación final", String(me.finalGrade));
    } catch (error) {
      console.error(
        "[CourseView] Error obteniendo calificación:",
        error
      );
      Alert.alert(
        "Error",
        "No se pudo obtener la calificación final."
      );
    } finally {
      setLoadingGrade(false);
    }
  };

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <View
          style={{
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.subtitle}>
            Creado:{" "}
            {courseData.createdDate
              ? new Date(courseData.createdDate).toLocaleDateString("es-ES")
              : "—"}
          </Text>

          <View style={styles.chipRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ID: {courseData.id}</Text>
            </View>

            <TouchableOpacity
              style={styles.linkPill}
              onPress={() =>
                router.push({
                  pathname: "/(courses)/participants",
                  params: { courseId: String(courseId) },
                })
              }
              activeOpacity={0.85}
            >
              <Ionicons name="people-outline" size={16} color="#ffffff" />
              <Text style={[styles.buttonText, { marginLeft: 6 }]}>
                Participantes
              </Text>
            </TouchableOpacity>

            {isStudent && (
              <TouchableOpacity
                style={[
                  styles.linkPill,
                  {
                    backgroundColor: colors.primary[60],
                    opacity: loadingGrade ? 0.7 : 1,
                  },
                ]}
                onPress={handleShowFinalGrade}
                activeOpacity={0.85}
                disabled={loadingGrade}
              >
                {loadingGrade ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons
                      name="school-outline"
                      size={16}
                      color="#ffffff"
                    />
                    <Text
                      style={[styles.buttonText, { marginLeft: 6 }]}
                    >
                      Ver mi calificación
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* --- resto del componente sin cambios --- */}
      <Text style={styles.title}>Contenidos</Text>
      {contents.length ? (
        contents.map((item) => (
          <TouchableOpacity
            key={item.type + "-" + item.id}
            style={styles.contentCard}
            activeOpacity={0.85}
            onPress={() => {
              if (item.type === "quiz") {
                router.push({
                  pathname:
                    "/(courses)/[courseId]/quizzes/[quizId]" as any,
                  params: {
                    courseId: String(courseId),
                    quizId: String(item.id),
                  },
                });
              } else if (item.type === "evaluation") {
                router.push({
                  pathname:
                    "/(courses)/[courseId]/evaluations/[evaluationId]" as any,
                  params: {
                    courseId: String(courseId),
                    evaluationId: String(item.id),
                  },
                });
              } else {
                router.push({
                  pathname:
                    "/(courses)/[courseId]/contents/[contentId]" as any,
                  params: {
                    courseId: String(courseId),
                    contentId: String(item.id),
                  },
                });
              }
            }}
          >
            <Text style={styles.subtitle}>
              {item.title || "Sin título"}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyText}>
          No hay contenidos disponibles.
        </Text>
      )}
    </ScrollView>
  );
}

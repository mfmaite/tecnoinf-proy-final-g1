import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../../styles/colors";
import { styles } from "../../../styles/styles";
import { getCourseById, CourseData, Content } from "../../../services/courses";
import { Ionicons } from "@expo/vector-icons";

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

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const data = await getCourseById(courseId);
        setCourseData(data.course);
        setContents(data.contents || []);
      } catch (err: any) {
        console.error("[CourseView] Error al cargar curso:", err.response?.data || err);
         setError(err.message || "No se pudieron cargar los datos del curso.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  useLayoutEffect(() => {
    if (!courseData) return;
    (navigation as any).setOptions?.({ title: courseData.name ?? "Curso" });
  }, [courseData, navigation]);

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
        <View style={{ flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.subtitle}>
            Creado: {courseData.createdDate ? new Date(courseData.createdDate).toLocaleDateString("es-ES") : "—"}
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
              <Text style={[styles.buttonText, { marginLeft: 6 }]}>Participantes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text style={[styles.subtitle, { marginBottom: 8 }]}>Foros</Text>
        <View style={{ flexDirection: "row", columnGap: 8 }}>
          <TouchableOpacity
            style={styles.forumButton}
            activeOpacity={0.85}
            onPress={() => {
              const forum = courseData.forums?.find((f) => f.type === "ANNOUNCEMENTS");
              if (!forum) return;
              router.push({
                pathname: "/[courseId]/forums/[forumId]",
                params: { courseId: String(courseData.id), forumId: String(forum.id), forumType: forum.type },
              });
            }}
          >
            <Ionicons name="megaphone-outline" size={18} color={colors.secondary[60]} />
            <Text style={styles.forumButtonText}>Anuncios</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.forumButton}
            activeOpacity={0.85}
            onPress={() => {
              const forum = courseData.forums?.find((f) => f.type === "CONSULTS");
              if (!forum) return;
              router.push({
                pathname: "/[courseId]/forums/[forumId]",
                params: { courseId: String(courseData.id), forumId: String(forum.id), forumType: forum.type },
              });
            }}
          >
            <Ionicons name="chatbubbles-outline" size={18} color={colors.secondary[60]} />
            <Text style={styles.forumButtonText}>Consultas</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>Contenidos</Text>
      {contents.length ? (
        contents.map((item) => (
          <TouchableOpacity
            key={item.type + "-" + item.id}
            style={styles.contentCard}
            activeOpacity={0.85}
            onPress={() => {
              if (item.type === "quiz") {
                router.push({ pathname: "/(courses)/[courseId]/quizzes/[quizId]" as any, params: { courseId: String(courseId), quizId: String(item.id) } });
              } else if (item.type === "evaluation") {
                router.push({ pathname: "/(courses)/[courseId]/evaluations/[evaluationId]" as any, params: { courseId: String(courseId), evaluationId: String(item.id) } });
              } else {
                router.push({ pathname: "/(courses)/[courseId]/contents/[contentId]" as any, params: { courseId: String(courseId), contentId: String(item.id) } });
              }
            }}
          >
            <Text style={styles.subtitle}>{item.title || "Sin título"}</Text>
            <View style={styles.chipRow}>
              <View style={[styles.chip]}>
                <Text style={styles.chipText}>
                  {item.type === "quiz" ? "Quiz" : item.type === "evaluation" ? "Evaluación" : "Contenido"}
                </Text>
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
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyText}>No hay contenidos disponibles.</Text>
      )}
    </ScrollView>
  );
}

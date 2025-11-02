import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, Linking, Alert, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "../../styles/colors";
import { getCourseById, CourseData, Content } from "../../services/courses";
import { styles } from "../../styles/styles";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export default function CourseView() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId?: string }>(); // <-- usar params
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    if (!courseId) return;
    const fetchCourse = async () => {
      try {
        const data = await getCourseById(String(courseId));
        setCourseData(data.course);
        setContents((data.contents || []).sort((a, b) => a.id - b.id));

      } catch (err) {
        setError("No se pudieron cargar los datos del curso: " + err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  useLayoutEffect(() => {
  if (courseData?.name) {
    (navigation as any).setOptions?.({ title: courseData.name });
  }
  }, [navigation, courseData?.name]);

  async function handleDownload(url?: string | null, fileName?: string | null) {
    if (!url) {
      Alert.alert("Archivo no disponible");
      return;
    }

    try {
      const name = fileName || url.split("/").pop() || `archivo_${Date.now()}`;
      const localPath = (FileSystem.documentDirectory ?? "") + name;
      const downloadResult = await FileSystem.downloadAsync(url, localPath);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, { mimeType: undefined });
      } else {
        await Linking.openURL(downloadResult.uri);
      }
    } catch (err) {
      console.warn("Error descargando archivo, fallback a abrir URL:", err);
      try {
        await Linking.openURL(url);
      } catch (e) {
        Alert.alert("No se puede descargar ni abrir el archivo.");
      }
    }
  }
  function renderContentWithLinks(content?: string | null) {
  if (!content) return null;
    const parts = content.split(/(https?:\/\/[^\s]+)/g);

    return (
      
      <Text style={styles.contentText}>
        {parts.map((part, idx) => {
          if (!part) return null;
          const isUrl = part.startsWith("http://") || part.startsWith("https://");
          if (isUrl) {
            return (
              <Text
                key={idx}
                style={styles.link}
                onPress={async () => {
                  try {
                    const url = part;
                    const supported = await Linking.canOpenURL(url);
                    if (supported) {
                      await Linking.openURL(url);
                    } else {
                      Alert.alert("No se puede abrir el enlace.");
                    }
                  } catch (e) {
                    Alert.alert("Error al abrir el enlace.");
                  }
                }}
              >
                {part}
              </Text>
            );
          } else {
            return <Text key={idx}>{part}</Text>;
          }
        })}
      </Text>
    );
  }
  if (loading) return <ActivityIndicator size="large" color={colors.primary[60]} style={styles.loader} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!courseData) return <Text style={styles.error}>Curso no encontrado.</Text>;

  return (
    <ScrollView style={styles.containerContent}>
      
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() =>
          router.push({
            pathname: "/(courses)/participants",
            params: { courseId: String(courseId) },
          })
        }
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Ver Participantes</Text>
      </TouchableOpacity>      
      <View style={styles.header}>
        
        <Text style={styles.subtitle}>ID: {courseData.id},
          Creado:{" "}
          {courseData.createdDate
            ? new Date(courseData.createdDate).toLocaleDateString("es-ES")
            : ""}
        </Text>
      </View>

      <Text style={styles.title}>Contenidos</Text>
      {contents.map((item) => (
        <View key={item.id} style={styles.contentCard}>
          <Text style={styles.subtitle}>{item.title || ""}</Text>
          
          {renderContentWithLinks(item.content)}
          {item.fileName && item.fileUrl && (
            <View>
              <Text style={styles.contentFile}>
                Archivo: {item.fileName} 
              </Text>
              <TouchableOpacity style={styles.buttonPrimary}
                onPress={() => handleDownload(item.fileUrl, item.fileName)}
                activeOpacity={0.8}
              >
              <Text style={styles.buttonText}>Descargar</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.contentDate}>
            Creado:{" "}
            {item.createdDate
              ? new Date(item.createdDate).toLocaleDateString("es-ES")
              : ""}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}


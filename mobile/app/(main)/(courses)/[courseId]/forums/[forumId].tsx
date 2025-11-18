import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useNavigation } from "@react-navigation/native";

import {
  getForumPosts,
  createForumPost,
  ForumPost,
} from "../../../../../services/forums";
import { getCourseById } from "../../../../../services/courses";
import { colors } from "../../../../../styles/colors";
import { styles as globalStyles } from "../../../../../styles/styles";
import { useAuth } from "../../../../../contexts/AuthContext";

export default function ForumView() {
  const { courseId, forumId } = useLocalSearchParams<{
    courseId?: string;
    forumId?: string;
  }>();

  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();

  // Convertimos a strings seguros y obligatorios (sin undefined)
  const safeCourseId = String(courseId ?? "");
  const safeForumId = String(forumId ?? "");

  const [forumType, setForumType] = useState<string>("");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isProfessor = user?.role === "PROFESOR" || user?.role === "ADMIN";

  // ─────────────────────────────────────────────
  // 📘 Cargar foro + posts
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!safeCourseId || !safeForumId) return;

    const fetch = async () => {
      try {
        const courseData = await getCourseById(safeCourseId);
        const forum = courseData.course.forums?.find((f) => f.id === safeForumId);

        setForumType(forum?.type || "");

        const data = await getForumPosts(safeForumId);
        setPosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [safeCourseId, safeForumId]);

  // ─────────────────────────────────────────────
  // 🧭 Header dinámico
  // ─────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!forumType) return;

    navigation.setOptions({
      title:
        forumType === "ANNOUNCEMENTS" ? "Foro de Anuncios" : "Foro de Consultas",
    });
  }, [forumType, navigation]);

  // ─────────────────────────────────────────────
  // 🔄 Refrescar posts al volver
  // ─────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      if (!safeForumId) return;

      let isActive = true;

      const refresh = async () => {
        try {
          const updated = await getForumPosts(safeForumId);
          if (isActive) setPosts(updated);
        } catch (err) {
          console.log("Error recargando posts:", err);
        }
      };

      refresh();

      return () => {
        isActive = false;
      };
    }, [safeForumId])
  );

  // ─────────────────────────────────────────────
  // ✍️ Publicar nuevo post
  // ─────────────────────────────────────────────
  const [isPosting, setIsPosting] = useState(false);

  async function handlePost() {
    if (!message.trim()) return Alert.alert("Escribe un mensaje.");
    if (isPosting) return;

    try {
      setIsPosting(true);
      const newPost = await createForumPost(safeForumId, { message });

      setPosts((prev) => [newPost, ...prev]);
      setMessage("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo publicar.");
    } finally {
      setIsPosting(false);
    }
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary[60]}
        style={globalStyles.loader}
      />
    );

  if (error) return <Text style={globalStyles.error}>{error}</Text>;

  const canPost =
    (forumType === "CONSULTS" && !!user?.ci) ||
    (forumType === "ANNOUNCEMENTS" && isProfessor);

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>
        {forumType === "ANNOUNCEMENTS"
          ? "Foro de Anuncios"
          : "Foro de Consultas"}
      </Text>

      {/* 📝 Crear post */}
      {canPost && (
        <View style={{ marginBottom: 24 }}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              backgroundColor: "#fff",
              marginBottom: 10,
            }}
            placeholder="Escribe un mensaje..."
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <TouchableOpacity
            style={[
              globalStyles.buttonPrimary,
              { flexDirection: "row", justifyContent: "center" },
              isPosting && { opacity: 0.7 },
            ]}
            onPress={handlePost}
            disabled={isPosting}
          >
            {isPosting && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={globalStyles.buttonText}>
              {isPosting ? "Publicando..." : "Publicar"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 📬 Posts */}
      {posts.length === 0 ? (
        <Text>No hay publicaciones aún.</Text>
      ) : (
        posts.map((p) => {
          const preview =
            p.message.length > 140 ? p.message.substring(0, 140) + "..." : p.message;

          return (
            <TouchableOpacity
              key={p.id}
              style={[
                globalStyles.contentCard,
                { paddingVertical: 14, paddingHorizontal: 16 },
              ]}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname:
                    "/(main)/(courses)/[courseId]/forums/[forumId]/[postId]",
                  params: {
                    courseId: safeCourseId,
                    forumId: safeForumId,
                    postId: String(p.id),
                  },
                })
              }
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                {p.authorPictureUrl ? (
                  <Image
                    source={{ uri: p.authorPictureUrl }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      marginRight: 8,
                    }}
                  />
                ) : null}
                <Text
                  style={{ fontWeight: "bold", color: colors.primary[70] }}
                >
                  {p.authorName}
                </Text>
              </View>

              <Text style={{ fontSize: 15, marginBottom: 6 }}>{preview}</Text>
              <Text style={{ fontSize: 12, color: "#777", textAlign: "right" }}>
                {new Date(p.createdDate).toLocaleString("es-ES")}
              </Text>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import {
  getForumPosts,
  createForumPost,
  ForumPost,
} from "../../../../services/forums";
import { colors } from "../../../../styles/colors";
import { styles as globalStyles } from "../../../../styles/styles";
import { useAuth } from "../../../../contexts/AuthContext";
import { getCourseById } from "../../../../services/courses";
type ForumParams = {
  courseId: string;
  forumId: string;
  forumType?: string;
};

export const screenOptions = ({
  route,
}: {
  route: { params?: ForumParams };
}): NativeStackNavigationOptions => ({
  title:
    route.params?.forumType === "ANNOUNCEMENTS"
      ? "Foro de Anuncios"
      : "Foro de Consultas",
  headerShown: true,
});

export default function ForumView() {
  const { courseId, forumId } = useLocalSearchParams<{
    courseId?: string;
    forumId?: string;
  }>();
  const { user } = useAuth();
  const router = useRouter();

  const [forumType, setForumType] = useState<string>("");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userCi = user?.ci ?? null;
  const isProfessor = user?.role === "PROFESOR" || user?.role === "ADMIN";

  // ────────────────────────────────
  // 📘 Cargar foro y posts
  // ────────────────────────────────
  useEffect(() => {
    if (!forumId || !courseId) return;
    const fetch = async () => {
      try {
        const courseData = await getCourseById(courseId);
        const forum = courseData.course.forums?.find((f) => f.id === forumId);
        setForumType(forum?.type || "");
        const data = await getForumPosts(forumId);
        setPosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [courseId, forumId]);

  useFocusEffect(
    useCallback(() => {
      if (!forumId) return;

      let isActive = true;
      const refreshPosts = async () => {
        try {
          setLoading(true);
          const updatedPosts = await getForumPosts(forumId);
          if (isActive) setPosts(updatedPosts);
        } catch (err: any) {
          console.error("[useFocusEffect] Error al recargar posts:", err);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      refreshPosts();
      return () => {
        isActive = false; // previene update si desmonta rápido
      };
    }, [forumId])
  );


  // ────────────────────────────────
  // ✍️ Publicar nuevo post
  // ────────────────────────────────
  const [isPosting, setIsPosting] = useState(false);
  async function handlePost() {
    if (!message.trim()) return Alert.alert("Escribe un mensaje.");
    if (isPosting) return;

    try {
      setIsPosting(true);
      const newPost = await createForumPost(forumId!, { message });
      setPosts((prev) => [newPost, ...prev]);
      setMessage("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo publicar.");
    } finally {
      setIsPosting(false);
    }
  }
  
  // ────────────────────────────────
  // 🧱 Render principal
  // ────────────────────────────────
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
    (forumType === "CONSULTS" && !!userCi) ||
    (forumType === "ANNOUNCEMENTS" && isProfessor);

  return (
    <ScrollView style={globalStyles.container}>

      {/* 📝 Campo para crear post */}
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
              { flexDirection: "row", justifyContent: "center", alignItems: "center" },
              isPosting && { opacity: 0.7 },
            ]}
            onPress={handlePost}
            disabled={isPosting}
            activeOpacity={0.8}
          >
            {isPosting && (
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={globalStyles.buttonText}>
              {isPosting ? "Publicando..." : "Publicar"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 📬 Listado de posts */}
      {posts.length === 0 ? (
        <Text>No hay publicaciones aún.</Text>
      ) : (
        posts.map((p) => {
          const preview =
            p.message.length > 140
              ? p.message.substring(0, 140).trim() + "..."
              : p.message;

          return (
            <TouchableOpacity
              key={p.id}
              style={[
                globalStyles.contentCard,
                {
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  marginBottom: 10,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/[courseId]/forums/[forumId]/[postId]",
                  params: {
                    courseId: String(courseId),
                    forumId: String(forumId),
                    postId: String(p.id),
                  },
                })
              }
              activeOpacity={0.8}
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
                <Text style={{ fontWeight: "bold", color: colors.primary[70] }}>
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

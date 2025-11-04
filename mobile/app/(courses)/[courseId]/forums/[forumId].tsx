import React, { useEffect, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getForumPosts,
  createForumPost,
  ForumPost,
} from "../../../../services/forums";
import { colors } from "../../../../styles/colors";
import { styles as globalStyles } from "../../../../styles/styles";
import { useAuth } from "../../../../contexts/AuthContext";
import { getCourseById } from "../../../../services/courses";

export default function ForumView() {
  const { courseId, forumId } = useLocalSearchParams<{ courseId?: string; forumId?: string }>();
  const { token, user } = useAuth();
  const router = useRouter();

  const [forumType, setForumType] = useState<string>("");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userCi = user?.ci ?? null;
  const isProfessor = user?.role === "PROFESOR" || user?.role === "ADMIN";

  useEffect(() => {
    if (!forumId || !courseId) return;
    const fetch = async () => {
      try {
        const courseData = await getCourseById(courseId);
        const forum = courseData.course.forums?.find((f) => f.id === forumId);
        setForumType(forum?.type || "");
        const data = await getForumPosts(forumId, token);
        setPosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [courseId, forumId, token]);

  async function handlePost() {
    if (!message.trim()) return Alert.alert("Escribe un mensaje.");
    try {
      const newPost = await createForumPost(forumId!, { message }, token);
      setPosts((prev) => [newPost, ...prev]);
      setMessage("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  if (loading)
    return <ActivityIndicator size="large" color={colors.primary[60]} style={globalStyles.loader} />;
  if (error) return <Text style={globalStyles.error}>{error}</Text>;

  const canPost =
    (forumType === "CONSULTS" && !!userCi) ||
    (forumType === "ANNOUNCEMENTS" && isProfessor);

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>
        {forumType === "ANNOUNCEMENTS" ? "Foro de Anuncios" : "Foro de Consultas"}
      </Text>

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
          <TouchableOpacity style={globalStyles.buttonPrimary} onPress={handlePost} activeOpacity={0.8}>
            <Text style={globalStyles.buttonText}>Publicar</Text>
          </TouchableOpacity>
        </View>
      )}

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
                { paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10 },
              ]}
              onPress={() => 
                // router.push(`/courses/${courseId}/forums/${forumId}/${p.id}`)
                router.push(`/${courseId}/forums/${forumId}/${p.id}`)
              }
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                {p.authorPictureUrl ? (
                  <Image
                    source={{ uri: p.authorPictureUrl }}
                    style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
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

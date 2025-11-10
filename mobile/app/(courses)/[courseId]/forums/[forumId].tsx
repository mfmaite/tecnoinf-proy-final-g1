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
import { useLocalSearchParams } from "expo-router";
import {
  getForumPosts,
  createForumPost,
  updateForumPost,
  deleteForumPost,
  ForumPost,
} from "../../../../services/forums";
import { colors } from "../../../../styles/colors";
import { styles as globalStyles } from "../../../../styles/styles";
import { useAuth } from "../../../../contexts/AuthContext";
import { getCourseById } from "../../../../services/courses";

export default function ForumView() {
  const { courseId, forumId } = useLocalSearchParams<{ courseId?: string; forumId?: string }>();
  const { token, user } = useAuth();
  const [forumType, setForumType] = useState<string>("");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [message, setMessage] = useState("");
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userCi = user?.ci ?? null;
  const userIsProfessor = user?.role === "PROFESOR" || user?.role === "ADMIN";

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

  async function handleEdit(postId: number) {
    if (!editedMessage.trim()) return Alert.alert("Mensaje vacío.");
    try {
      const updated = await updateForumPost(postId, { message: editedMessage }, token);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      setEditingPost(null);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  async function handleDelete(postId: number) {
    Alert.alert("Confirmar eliminación", "¿Deseas eliminar este post?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteForumPost(postId, token);
            setPosts((prev) => prev.filter((p) => p.id !== postId));
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  }

  if (loading)
    return <ActivityIndicator size="large" color={colors.primary[60]} style={globalStyles.loader} />;
  if (error) return <Text style={globalStyles.error}>{error}</Text>;

  const canPost =
    forumType === "CONSULTS" ||
    (forumType === "ANNOUNCEMENTS" && userIsProfessor);

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>
        {forumType === "ANNOUNCEMENTS" ? "Foro de Anuncios" : "Foro de Consultas"}
      </Text>
      {canPost ? (
        <View style={{ marginBottom: 20 }}>
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
            style={globalStyles.buttonPrimary}
            onPress={handlePost}
            activeOpacity={0.8}
          >
            <Text style={globalStyles.buttonText}>Publicar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={{ marginBottom: 20, color: "#777", fontStyle: "italic" }}>
          Solo los profesores pueden publicar en este foro.
        </Text>
      )}

      {posts.length === 0 ? (
        <Text>No hay publicaciones aún.</Text>
      ) : (
        posts.map((p) => {
          const isAuthor = p.authorCi === userCi;
          const canEditDelete = isAuthor || userIsProfessor;

          return (
            <View key={p.id} style={globalStyles.contentCard}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                {p.authorPictureUrl ? (
                  <Image
                    source={{ uri: p.authorPictureUrl }}
                    style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                  />
                ) : null}
                <Text style={{ fontWeight: "bold", color: colors.primary[70] }}>{p.authorName}</Text>
              </View>

              {editingPost === p.id ? (
                <>
                  <TextInput
                    value={editedMessage}
                    onChangeText={setEditedMessage}
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 8,
                      padding: 8,
                      backgroundColor: "#fff",
                      marginBottom: 6,
                    }}
                    multiline
                  />
                  <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                    <TouchableOpacity
                      onPress={() => setEditingPost(null)}
                      style={[
                        globalStyles.buttonSecondary,
                        { marginRight: 8, paddingHorizontal: 20 },
                      ]}
                    >
                      <Text style={globalStyles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleEdit(p.id)}
                      style={[globalStyles.buttonPrimary, { paddingHorizontal: 20 }]}
                    >
                      <Text style={globalStyles.buttonText}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 15, marginBottom: 6 }}>{p.message}</Text>
                  <Text style={{ fontSize: 12, color: "#777", textAlign: "right" }}>
                    {new Date(p.createdDate).toLocaleString("es-ES")}
                  </Text>

                  {canEditDelete && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        marginTop: 6,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setEditingPost(p.id);
                          setEditedMessage(p.message);
                        }}
                        style={[
                          globalStyles.buttonSecondary,
                          { paddingHorizontal: 20, marginRight: 8 },
                        ]}
                      >
                        <Text style={globalStyles.buttonText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(p.id)}
                        style={[globalStyles.buttonPrimary, { paddingHorizontal: 20 }]}
                      >
                        <Text style={globalStyles.buttonText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

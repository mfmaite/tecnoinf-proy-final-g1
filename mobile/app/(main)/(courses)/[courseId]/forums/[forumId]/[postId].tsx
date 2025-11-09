import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../../../../../contexts/AuthContext";
import { colors } from "../../../../../../styles/colors";
import { styles as globalStyles } from "../../../../../../styles/styles";
import { getPostById, deletePost, createResponse } from "../../../../../../services/posts";

export default function PostDetail() {
  const { courseId, postId } = useLocalSearchParams<{ courseId?: string; postId?: string }>();
  const { token, user, isProfessor } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");

  const userCi = user?.ci ?? null;

  // ───────────────────────────────
  // FETCH DATA
  // ───────────────────────────────
  useEffect(() => {
    if (!postId) return;
    const fetch = async () => {
      try {
        const { post, responses } = await getPostById(postId);
        setPost(post);
        setResponses(responses);
      } catch (err: any) {
        setError(err.message || "Error al cargar el post.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [postId]);

  // ───────────────────────────────
  // ACTIONS
  // ───────────────────────────────
  async function handleDelete() {
    Alert.alert("Confirmar eliminación", "¿Seguro que querés eliminar este post?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost(postId!, token);
            Alert.alert("Post eliminado correctamente.");
            router.back();
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  }

  async function handleReply() {
    if (!replyText.trim()) return Alert.alert("Escribí una respuesta.");
    try {
      const newResp = await createResponse(postId!, replyText, token);
      setResponses((prev) => [newResp, ...prev]);
      setReplyText("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  // ───────────────────────────────
  // RENDER
  // ───────────────────────────────
  if (loading)
    return <ActivityIndicator size="large" color={colors.primary[60]} style={globalStyles.loader} />;
  if (error) return <Text style={globalStyles.error}>{error}</Text>;
  if (!post) return <Text>No se encontró el post.</Text>;

  // Permisos
  const isAuthor = userCi === post.authorCi;
  const canEditDelete = isAuthor || isProfessor;
  const canRespond = !!token;

  return (
    <ScrollView style={globalStyles.container}>
      {/* CABECERA */}
      <Text style={globalStyles.title}>{post.authorName}</Text>
      <Text style={globalStyles.contentText}>{post.message}</Text>
      <Text style={globalStyles.contentDate}>
        {new Date(post.createdDate).toLocaleString("es-ES")}
      </Text>

      {/* ACCIONES */}
      {canEditDelete && (
        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <TouchableOpacity
            style={[globalStyles.buttonPrimary, { marginRight: 10 }]}
            onPress={() => Alert.alert("Función de edición próxima")}
          >
            <Text style={globalStyles.buttonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.buttonSecondary} onPress={handleDelete}>
            <Text style={globalStyles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* RESPUESTAS */}
      <Text style={[globalStyles.title, { marginTop: 24 }]}>Respuestas</Text>

      {canRespond && (
        <View style={{ marginBottom: 16 }}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              backgroundColor: "#fff",
              marginBottom: 10,
            }}
            placeholder="Escribe una respuesta..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity
            style={globalStyles.buttonPrimary}
            onPress={handleReply}
            activeOpacity={0.8}
          >
            <Text style={globalStyles.buttonText}>Responder</Text>
          </TouchableOpacity>
        </View>
      )}

      {responses.length === 0 ? (
        <Text>No hay respuestas aún.</Text>
      ) : (
        responses.map((r) => (
          <View key={r.id} style={globalStyles.contentCard}>
            <Text style={{ fontWeight: "bold", color: colors.primary[70] }}>{r.authorName}</Text>
            <Text style={{ fontSize: 15, marginVertical: 4 }}>{r.message}</Text>
            <Text style={{ fontSize: 12, color: "#777" }}>
              {new Date(r.createdDate).toLocaleString("es-ES")}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

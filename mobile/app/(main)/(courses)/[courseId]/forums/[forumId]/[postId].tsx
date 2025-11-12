import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  getPostById,
  createResponse,
  deletePost,
  updatePost,
} from "../../../../../../services/posts";
import { useAuth } from "../../../../../../contexts/AuthContext";
import { colors } from "../../../../../../styles/colors";
import { styles as globalStyles } from "../../../../../../styles/styles";

interface Post {
  id: number;
  authorCi: string;
  authorName: string;
  authorPictureUrl?: string | null;
  message: string;
  createdDate: string;
}

export default function PostDetail() {
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [responses, setResponses] = useState<Post[]>([]);
  const [forumType, setForumType] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");

  const userCi = user?.ci ? String(user.ci) : "";
  const isProfessor = user?.role === "PROFESOR" || user?.role === "ADMIN";

  /*───────────────────────────────
    🔁 Cargar post y respuestas
  ───────────────────────────────*/
  const loadPost = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const result = await getPostById(postId);
      setPost(result.post);
      setResponses(result.responses || []);
      if (result.forum?.type) setForumType(result.forum.type);
    } catch (err: any) {
      console.error("[loadPost] Error:", err);
      Alert.alert("Error", err.message || "No se pudo cargar el post.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  /*───────────────────────────────
    🗨️ Crear respuesta
  ───────────────────────────────*/
  async function handleReply() {
    if (!replyText.trim()) return Alert.alert("Escribí una respuesta.");

    try {
      await createResponse(String(postId), replyText);
      setReplyText("");
      await loadPost();
    } catch (err: any) {
      console.error("[handleReply] Error:", err);
      const rawMessage = err.message || "";
      let message = "No se pudo enviar la respuesta.";

      if (rawMessage.includes("anuncios")) {
        message = "No se pueden responder publicaciones del foro de anuncios.";
      } else if (rawMessage.includes("403")) {
        message = "No tenés permisos para responder en este foro.";
      } else if (rawMessage.includes("401")) {
        message = "Sesión expirada. Iniciá sesión nuevamente.";
      }

      Alert.alert("Aviso", message);
    }
  }

  /*───────────────────────────────
    ✏️ Editar post o respuesta
  ───────────────────────────────*/
  async function handleEdit(id: number, message: string) {
    if (!message.trim()) return Alert.alert("Mensaje vacío.");
    try {
      await updatePost(String(id), message);
      setEditingId(null);
      setEditedText("");
      await loadPost();
    } catch (err: any) {
      console.error("[handleEdit] Error:", err);
      Alert.alert("Error", err.message || "No se pudo editar el mensaje.");
    }
  }

  /*───────────────────────────────
    🗑️ Eliminar post o respuesta
  ───────────────────────────────*/
  async function handleDelete(id: number) {
    Alert.alert("Confirmar", "¿Seguro que querés eliminar este mensaje?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost(String(id));

            if (id === post?.id) {
              Alert.alert("Eliminado", "El post se eliminó correctamente.", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } else {
              await loadPost();
            }
          } catch (err: any) {
            console.error("[handleDelete] Error:", err);
            const msg =
              err.message?.includes("foreign key constraint") ||
              err.message?.includes("Cannot delete or update a parent row")
                ? "No se puede eliminar este post porque tiene respuestas asociadas."
                : err.message || "No se pudo eliminar el mensaje.";
            Alert.alert("Aviso", msg);
          }
        },
      },
    ]);
  }

  /*───────────────────────────────
    ⏳ Estado de carga
  ───────────────────────────────*/
  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary[60]}
        style={globalStyles.loader}
      />
    );

  if (!post)
    return <Text style={globalStyles.error}>No se encontró el post.</Text>;

  /*───────────────────────────────
    🎨 Render principal
  ───────────────────────────────*/
  return (
    <ScrollView style={globalStyles.container}>
      {/* 🟢 Post principal */}
      <View style={[globalStyles.contentCard, localStyles.mainPost]}>
        <View style={localStyles.replyHeader}>
          {post.authorPictureUrl && (
            <Image
              source={{ uri: post.authorPictureUrl }}
              style={localStyles.avatarLarge}
            />
          )}
          <Text style={localStyles.replyAuthor}>{post.authorName}</Text>
        </View>

        {editingId === post.id ? (
          <>
            <TextInput
              value={editedText}
              onChangeText={setEditedText}
              style={localStyles.inputEdit}
              multiline
            />
            <View style={globalStyles.actionsRow}>
              <TouchableOpacity
                onPress={() => setEditingId(null)}
                style={[globalStyles.buttonSecondary, { marginRight: 8 }]}
              >
                <Text style={globalStyles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleEdit(post.id, editedText)}
                style={globalStyles.buttonPrimary}
              >
                <Text style={globalStyles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={globalStyles.contentText}>{post.message}</Text>
            <Text style={localStyles.replyDate}>
              {new Date(post.createdDate).toLocaleString("es-ES")}
            </Text>
            {(String(post.authorCi) === userCi || isProfessor) && (
              <View style={[globalStyles.actionsRow, { marginTop: 10 }]}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingId(post.id);
                    setEditedText(post.message);
                  }}
                  style={[globalStyles.buttonSecondary, { marginRight: 8 }]}
                >
                  <Text style={globalStyles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(post.id)}
                  style={globalStyles.buttonPrimary}
                >
                  <Text style={globalStyles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* ✏️ Campo para responder — solo si no es foro de anuncios */}
      {forumType !== "ANNOUNCEMENTS" && (
        <View style={localStyles.replyBox}>
          <TextInput
            style={localStyles.inputReply}
            placeholder="Escribe una respuesta..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity
            style={globalStyles.buttonPrimary}
            onPress={handleReply}
          >
            <Text style={globalStyles.buttonText}>Responder</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 💬 Lista de respuestas */}
      <Text style={[globalStyles.title, { marginTop: 16 }]}>Respuestas</Text>
      {responses.length ? (
        responses.map((r) => {
          const isAuthor = String(r.authorCi) === userCi;
          return (
            <View
              key={r.id}
              style={[globalStyles.contentCard, localStyles.replyCard]}
            >
              <View style={localStyles.replyHeader}>
                {r.authorPictureUrl && (
                  <Image
                    source={{ uri: r.authorPictureUrl }}
                    style={localStyles.avatarSmall}
                  />
                )}
                <Text style={localStyles.replyAuthor}>{r.authorName}</Text>
              </View>

              {editingId === r.id ? (
                <>
                  <TextInput
                    value={editedText}
                    onChangeText={setEditedText}
                    style={localStyles.inputEdit}
                    multiline
                  />
                  <View style={globalStyles.actionsRow}>
                    <TouchableOpacity
                      onPress={() => setEditingId(null)}
                      style={[globalStyles.buttonSecondary, { marginRight: 8 }]}
                    >
                      <Text style={globalStyles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleEdit(r.id, editedText)}
                      style={globalStyles.buttonPrimary}
                    >
                      <Text style={globalStyles.buttonText}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={globalStyles.contentText}>{r.message}</Text>
                  <Text style={localStyles.replyDate}>
                    {new Date(r.createdDate).toLocaleString("es-ES")}
                  </Text>
                  {(isAuthor || isProfessor) && (
                    <View style={[globalStyles.actionsRow, { marginTop: 8 }]}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingId(r.id);
                          setEditedText(r.message);
                        }}
                        style={[
                          globalStyles.buttonSecondary,
                          { marginRight: 8 },
                        ]}
                      >
                        <Text style={globalStyles.buttonText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(r.id)}
                        style={globalStyles.buttonPrimary}
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
      ) : (
        <Text style={globalStyles.emptyText}>No hay respuestas aún.</Text>
      )}
    </ScrollView>
  );
}

/*───────────────────────────────
  🎨 Estilos
────────────────────────────────*/
const localStyles = StyleSheet.create({
  mainPost: { borderLeftWidth: 4, borderLeftColor: colors.primary[70] },
  replyCard: {
    marginVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[40],
  },
  replyHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  replyAuthor: { fontWeight: "bold", color: colors.primary[70] },
  replyDate: {
    fontSize: 12,
    color: colors.textNeutral[40],
    textAlign: "right",
  },
  replyBox: { marginTop: 20, marginBottom: 10 },
  inputReply: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  inputEdit: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
    marginBottom: 6,
  },
  avatarLarge: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  avatarSmall: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
});

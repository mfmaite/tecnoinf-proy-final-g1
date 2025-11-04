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
import { useLocalSearchParams } from "expo-router";
import {
  getPostById,
  createResponse,
  deletePost,
  updatePost,
} from "../../../../../services/posts";
import { useAuth } from "../../../../../contexts/AuthContext";
import { colors } from "../../../../../styles/colors";
import { styles as globalStyles } from "../../../../../styles/styles";

interface PostNode {
  id: number;
  authorCi: string;
  authorName: string;
  authorPictureUrl?: string | null;
  message: string;
  createdDate: string;
  replies?: PostNode[];
}

export default function PostDetail() {
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const { token, user } = useAuth();

  const [post, setPost] = useState<PostNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<PostNode | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");

  const userCi = user?.ci ?? null;
  const isProfessor = user?.role === "PROFESOR" || user?.role === "ADMIN";

  // ────────────────────────────────
  // FETCH POST
  // ────────────────────────────────
  const loadPost = useCallback(async () => {
    if (!postId || !token) return;
    try {
      const result = await getPostById(postId, token);
      const { post, responses } = result;
      const nested = buildNestedReplies(post, responses);
      setPost(nested);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }, [postId, token]); // ← dependencias fijas

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  useEffect(() => {
    loadPost();
  }, [loadPost, postId, token]);

  function buildNestedReplies(root: PostNode, responses: PostNode[]): PostNode {
    const map = new Map<number, PostNode>();
    responses.forEach((r) => map.set(r.id, { ...r, replies: [] }));
    const topLevel: PostNode[] = [];

    responses.forEach((r) => {
      const parentId = (r as any).replyToId;
      if (parentId && map.has(parentId)) {
        map.get(parentId)!.replies!.push(r);
      } else {
        topLevel.push(r);
      }
    });

    return { ...root, replies: topLevel };
  }

  // ────────────────────────────────
  // HANDLERS
  // ────────────────────────────────
  async function handleReply(parentId?: number) {
    if (!replyText.trim()) return Alert.alert("Escribí una respuesta.");
    if (!token) return Alert.alert("Token no disponible.");
    try {
      const targetId = String(parentId ?? postId);
      await createResponse(targetId, replyText, token);
      setReplyText("");
      setReplyingTo(null);
      await loadPost(); // ✅ refrescamos todo
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  async function handleEdit(id: number, message: string) {
    if (!message.trim()) return Alert.alert("Mensaje vacío.");
    if (!token) return Alert.alert("Token no disponible.");
    try {
      await updatePost(String(id), message, token);
      setEditingId(null);
      setEditedText("");
      await loadPost(); // ✅ recargamos post actualizado
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return Alert.alert("Token no disponible.");
    Alert.alert("Confirmar", "¿Seguro que querés eliminar este mensaje?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost(String(id), token);
            if (post?.id === id) {
              setPost(null);
            } else {
              await loadPost(); // ✅ refresca si era respuesta
            }
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  }

  // ────────────────────────────────
  // RENDER
  // ────────────────────────────────
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

  const ReplyItem: React.FC<{ item: PostNode; depth: number }> = ({
    item,
    depth,
  }) => {
    const isAuthor = item.authorCi === userCi;

    return (
      <View
        style={[
          globalStyles.contentCard,
          localStyles.replyCard,
          { marginLeft: Math.min(depth * 18, 60) },
        ]}
      >
        <View style={localStyles.replyHeader}>
          {item.authorPictureUrl ? (
            <Image
              source={{ uri: item.authorPictureUrl }}
              style={localStyles.avatarSmall}
            />
          ) : null}
          <Text style={localStyles.replyAuthor}>{item.authorName}</Text>
        </View>

        {editingId === item.id ? (
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
                onPress={() => handleEdit(item.id, editedText)}
                style={globalStyles.buttonPrimary}
              >
                <Text style={globalStyles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={globalStyles.contentText}>{item.message}</Text>
            <Text style={localStyles.replyDate}>
              {new Date(item.createdDate).toLocaleString("es-ES")}
            </Text>
            <View style={[globalStyles.actionsRow, { flexWrap: "wrap" }]}>
              <TouchableOpacity
                onPress={() => setReplyingTo(item)}
                style={[globalStyles.buttonSecondary, { marginRight: 8 }]}
              >
                <Text style={globalStyles.buttonText}>Responder</Text>
              </TouchableOpacity>
              {(isAuthor || isProfessor) && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingId(item.id);
                      setEditedText(item.message);
                    }}
                    style={[globalStyles.buttonSecondary, { marginRight: 8 }]}
                  >
                    <Text style={globalStyles.buttonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={globalStyles.buttonPrimary}
                  >
                    <Text style={globalStyles.buttonText}>Eliminar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        )}

        {item.replies?.length
          ? item.replies.map((child) => (
              <ReplyItem key={child.id} item={child} depth={depth + 1} />
            ))
          : null}
      </View>
    );
  };

  return (
    <ScrollView style={globalStyles.container}>
      {/* 🟢 Post principal */}
      <View style={[globalStyles.contentCard, localStyles.mainPost]}>
        <View style={localStyles.replyHeader}>
          {post.authorPictureUrl ? (
            <Image
              source={{ uri: post.authorPictureUrl }}
              style={localStyles.avatarLarge}
            />
          ) : null}
          <Text style={localStyles.replyAuthor}>{post.authorName}</Text>
        </View>
        <Text style={globalStyles.contentText}>{post.message}</Text>
        <Text style={localStyles.replyDate}>
          {new Date(post.createdDate).toLocaleString("es-ES")}
        </Text>

        {(post.authorCi === userCi || isProfessor) && (
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
      </View>

      {/* Campo para responder */}
      <View style={localStyles.replyBox}>
        {replyingTo && (
          <Text style={localStyles.replyingText}>
            Respondiendo a {replyingTo.authorName}
          </Text>
        )}
        <TextInput
          style={localStyles.inputReply}
          placeholder="Escribe una respuesta..."
          value={replyText}
          onChangeText={setReplyText}
          multiline
        />
        <View style={globalStyles.actionsRow}>
          {replyingTo && (
            <TouchableOpacity
              style={[globalStyles.buttonSecondary, { marginRight: 8 }]}
              onPress={() => setReplyingTo(null)}
            >
              <Text style={globalStyles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={globalStyles.buttonPrimary}
            onPress={() => handleReply(replyingTo?.id)}
          >
            <Text style={globalStyles.buttonText}>Responder</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Respuestas */}
      <Text style={[globalStyles.title, { marginTop: 16 }]}>Respuestas</Text>
      {post.replies?.length ? (
        post.replies.map((r) => <ReplyItem key={r.id} item={r} depth={1} />)
      ) : (
        <Text style={globalStyles.emptyText}>No hay respuestas aún.</Text>
      )}
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  mainPost: { borderLeftWidth: 4, borderLeftColor: colors.primary[70] },
  replyCard: {
    marginVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[40],
    maxWidth: "95%",
  },
  replyHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  replyAuthor: { fontWeight: "bold", color: colors.primary[70] },
  replyDate: {
    fontSize: 12,
    color: colors.textNeutral[40],
    textAlign: "right",
  },
  replyBox: { marginTop: 20, marginBottom: 10 },
  replyingText: {
    fontStyle: "italic",
    color: colors.textNeutral[40],
    marginBottom: 6,
  },
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

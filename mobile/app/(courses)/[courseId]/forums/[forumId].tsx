import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getForumPosts, ForumPost } from "../../../../services/forums";
import { colors } from "../../../../styles/colors";
import { styles as globalStyles } from "../../../../styles/styles";

export default function ForumView() {
  const { forumId } = useLocalSearchParams<{ forumId?: string }>();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!forumId) return;
    const fetch = async () => {
      try {
        const data = await getForumPosts(forumId);
        setPosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [forumId]);

  if (loading)
    return <ActivityIndicator size="large" color={colors.primary[60]} style={globalStyles.loader} />;
  if (error) return <Text style={globalStyles.error}>{error}</Text>;

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Posts</Text>
      {posts.length === 0 ? (
        <Text>No hay posts todavía.</Text>
      ) : (
        posts.map((p) => (
          <View key={p.id} style={localStyles.postCard}>
            <Text style={localStyles.author}>{p.authorName}</Text>
            <Text style={localStyles.message}>{p.message}</Text>
            <Text style={localStyles.date}>
              {new Date(p.createdDate).toLocaleString("es-ES")}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  author: { fontWeight: "bold", color: colors.primary[70], marginBottom: 4 },
  message: { fontSize: 15, marginBottom: 6 },
  date: { fontSize: 12, color: "#777", textAlign: "right" },
});

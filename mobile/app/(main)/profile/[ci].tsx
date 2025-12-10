import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  useNavigation,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../services/api";
import { getOrCreateChatWith } from "../../../services/chat";
import { colors } from "../../../styles/colors";
import { styles } from "../../../styles/styles";
import { useAuth } from "../../../contexts/AuthContext";

interface UserProfile {
  ci: string;
  name: string;
  email?: string | null;
  description?: string | null;
  pictureUrl?: string | null;
  role?: string | null;
}

export default function ViewProfileScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { ci } = useLocalSearchParams<{ ci: string }>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ────────────────────────────────
  // 📦 Obtener perfil por CI
  // ────────────────────────────────
  useEffect(() => {
    if (!ci) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/profile?ci=${ci}`);
        setProfile(response.data.data);
      } catch (err: any) {
        console.error("[ProfileView] Error:", err);
        setError("No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [ci]);

  // ────────────────────────────────
  // 🏷 Actualizar título dinámico
  // ────────────────────────────────
  useEffect(() => {
    if (profile?.name) {
      navigation.setOptions({
        title: `Perfil de ${profile.name}`,
      });
    }
  }, [profile, navigation]);

  // ────────────────────────────────
  // ⏳ Estado de carga / error
  // ────────────────────────────────
  if (loading)
    return (
      <View style={localStyles.center}>
        <ActivityIndicator size="large" color={colors.primary[60]} />
      </View>
    );

  if (error)
    return (
      <View style={localStyles.center}>
        <Text style={localStyles.errorText}>{error}</Text>
      </View>
    );

  if (!profile)
    return (
      <View style={localStyles.center}>
        <Text style={localStyles.errorText}>Perfil no encontrado.</Text>
      </View>
    );

  // ────────────────────────────────
  // 💬 Mostrar botón de "Enviar mensaje" solo si:
  //   - el perfil es de un profesor
  //   - y el usuario logueado es distinto
  // ────────────────────────────────
  const canMessage =
    user && user.ci !== profile.ci && profile.role === "PROFESOR";

  const handleStartChat = async () => {
    try {
      const chat = await getOrCreateChatWith(profile.ci);
      if (!chat?.id) {
        Alert.alert("Error", "No se pudo obtener o crear el chat.");
        return;
      }

      router.push({
        pathname: "/(main)/chats/[partnerCi]",
        params: { partnerCi: profile.ci, chatId: String(chat.id) },
      });
    } catch {
      Alert.alert("Error", "No se pudo iniciar el chat.");
    }
  };

  // ────────────────────────────────
  // 🎨 Render principal
  // ────────────────────────────────
  return (
    <ScrollView contentContainerStyle={localStyles.container}>
      {/* Avatar */}
      <View style={localStyles.avatarWrapper}>
        {profile.pictureUrl ? (
          <Image
            source={{ uri: profile.pictureUrl }}
            style={localStyles.avatarImage}
          />
        ) : (
          <Ionicons
            name="person-circle-outline"
            size={120}
            color={colors.textNeutral[20]}
          />
        )}
      </View>

      {/* Rol (con estilo de name) */}
      <Text style={localStyles.name}>
        {profile.role === "PROFESOR" ? "Profesor" : "Estudiante"}
      </Text>

      {/* Info detallada */}
      <View style={localStyles.infoCard}>
        <Text style={localStyles.label}>CI:</Text>
        <Text style={localStyles.value}>{profile.ci}</Text>

        <Text style={localStyles.label}>Correo:</Text>
        <Text style={localStyles.value}>
          {profile.email || "No disponible"}
        </Text>

        {profile.description ? (
          <>
            <Text style={localStyles.label}>Descripción:</Text>
            <Text style={localStyles.value}>{profile.description}</Text>
          </>
        ) : null}
      </View>

      {/* Enviar mensaje */}
      {canMessage && (
        <TouchableOpacity
          style={[styles.msgButton, { marginTop: 24 }]}
          onPress={handleStartChat}
          activeOpacity={0.8}
        >
          <Text style={styles.msgButtonText}>Enviar mensaje</Text>
        </TouchableOpacity>
      )}

      {/* 🔙 Volver */}
      <TouchableOpacity
        style={[styles.button, { marginTop: 16 }]}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ────────────────────────────────
// 🎨 Estilos locales
// ────────────────────────────────
const localStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarWrapper: {
    marginBottom: 16,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceLight[20],
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary[70],
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontWeight: "600",
    color: "#444",
    marginTop: 10,
  },
  value: {
    color: "#333",
  },
  errorText: {
    color: "red",
  },
});

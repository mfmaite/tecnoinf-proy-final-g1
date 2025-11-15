/*import React, { useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { styles  } from "../../styles/styles"; // usa tus estilos globales

export default function ViewPerfil() {
  const {
    ci,
    name,
    email,
    description,
    pictureUrl,
    role,
  } = useLocalSearchParams<{    
    ci?: string;
    name?: string;
    email?: string;
    description?: string;
    pictureUrl?: string;
    role?: string;
  }>();
  const navigation = useNavigation();
  useEffect(() => {
    console.log("[viewPerfil] params:", { ci, name, email, description, pictureUrl, role });
  }, [ci, name, email, description, pictureUrl, role]);
  useLayoutEffect(() => {
    if (name) {
      (navigation as any).setOptions?.({ title: String(name) });
    }
  }, [navigation, name]);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, styles.container]}
    >
      <View style={styles.card}>
        {pictureUrl ? (
          <Image source={{ uri: String(pictureUrl) }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {name ? String(name).charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
        )}
        <Text style={localStyles.name}>{name ?? "-"}</Text>
        <View style={localStyles.row}>
          <Text style={localStyles.label}>CI:</Text>
          <Text style={localStyles.value}>{ci ?? "-"}</Text>
        </View>

        <View style={localStyles.row}>
          <Text style={localStyles.label}>Email:</Text>
          <Text style={localStyles.value}>{email ?? "-"}</Text>
        </View>


        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Descripción</Text>
          <Text style={localStyles.description}>{description ?? "-"}</Text>
        </View>
        {role === "PROFESOR" && (
        <TouchableOpacity
          style={styles.msgButton}
          activeOpacity={0.8}
          onPress={() => Alert.alert("Acción", "Funcionalidad no implementada")}
        >
          <Text style={styles.msgButtonText}>Enviar mensaje</Text>
        </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-start",
    paddingVertical: 6,
  },
  label: {
    color: "#6B7280",
    marginRight: 8,
    width: 80,
    fontWeight: "600",
  },
  value: {
    color: "#111827",
    flex: 1,
  },
  section: {
    width: "100%",
    marginTop: 12,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 6,
  },
  description: {
    color: "#374151",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
    color: "#111827",
    overflow: "hidden",
  },
  badgeProfesor: {
    backgroundColor: "#FEF3C7",
  },
});*/
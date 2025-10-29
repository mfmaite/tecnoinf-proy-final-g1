// app/(main)/profile/index.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { styles as globalStyles } from "../../../styles/styles";
import { colors } from "../../../styles/colors";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const goToEditProfile = () => {
    router.push("/(main)/profile/edit-profile");
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Mi Perfil</Text>

      {user?.pictureUrl ? (
        <Image source={{ uri: user.pictureUrl }} style={localStyles.avatar} />
      ) : (
        <View style={[localStyles.avatar, localStyles.avatarPlaceholder]}>
          <Text style={localStyles.avatarInitial}>
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
      )}

      <View style={localStyles.infoBox}>
        <Text style={localStyles.label}>Nombre</Text>
        <Text style={localStyles.value}>{user?.name || "N/A"}</Text>

        <Text style={localStyles.label}>Email</Text>
        <Text style={localStyles.value}>{user?.email || "N/A"}</Text>

        <Text style={localStyles.label}>Rol</Text>
        <Text style={localStyles.value}>{user?.role || "N/A"}</Text>

        {user?.description ? (
          <>
            <Text style={localStyles.label}>Descripción</Text>
            <Text style={localStyles.value}>{user.description}</Text>
          </>
        ) : null}
      </View>

      <TouchableOpacity style={globalStyles.buttonPrimary} onPress={goToEditProfile}>
        <Text style={globalStyles.buttonText}>Editar perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.buttonSecondary, { backgroundColor: colors.accent.danger[50] }]}
        onPress={handleLogout}
      >
        <Text style={globalStyles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: colors.surfaceLight[30],
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 40,
    color: colors.textNeutral[10],
    fontWeight: "700" as const,
  },
  infoBox: {
    width: "100%",
    backgroundColor: colors.surfaceLight[10],
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontWeight: "600" as const,
    color: colors.textNeutral[40],
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: colors.textNeutral[50],
  },
});

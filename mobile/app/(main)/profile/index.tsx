import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { styles as globalStyles } from "../../../styles/styles";
import { colors } from "../../../styles/colors";
import { UserProfilePicture } from "../../../components/user-profile-picture/user-profile-picture";

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

  console.log(user);

  return (
    <View style={globalStyles.container}>

      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <UserProfilePicture name={user?.name || "?"} pictureUrl={user?.pictureUrl} size="2xl" />
      </View>

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

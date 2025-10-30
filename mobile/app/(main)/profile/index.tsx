import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      {user?.pictureUrl ? (
        <Image source={{ uri: user.pictureUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{user?.name || "N/A"}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || "N/A"}</Text>

        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{user?.role || "N/A"}</Text>

        {user?.description ? (
          <>
            <Text style={styles.label}>Descripción</Text>
            <Text style={styles.value}>{user.description}</Text>
          </>
        ) : null}
      </View>

      <View style={styles.buttonsContainer}>
        <Link href="./(main)/profile/edit-profile" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Editar perfil</Text>
          </TouchableOpacity>
        </Link>
        <Link href="./(main)/profile/change-password" asChild>
            <TouchableOpacity>
                <Text>Cambiar contraseña</Text>
            </TouchableOpacity>
        </Link>

        <TouchableOpacity
          onPress={logout}
          style={[styles.button, { backgroundColor: "#dc3545" }]}
        >
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 25 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  avatarPlaceholder: {
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { fontSize: 40, color: "#fff" },
  infoBox: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  label: { fontWeight: "bold", color: "#333", marginTop: 10 },
  value: { fontSize: 16, color: "#555" },
  buttonsContainer: { width: "100%" },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

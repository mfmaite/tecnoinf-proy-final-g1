import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function editProfile() {
return (
<View style={styles.container}>
      <Text style={styles.title}>Cambiar contraseña</Text>
      <View style={styles.buttonsContainer}>
        <Link href="./(main)/profile/change-password" asChild>
            <TouchableOpacity>
                <Text>Cambiar contraseña</Text>
            </TouchableOpacity>
            </Link>


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
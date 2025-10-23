import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { colors } from "../../styles/colors";

export default function HomeScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const handleCourses = () => {
    router.push("/(courses)/coursesList");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido a EVA Mobile!</Text>
      <Text style={styles.subtitle}>
        Accede a tus cursos o cierra la sesión
      </Text>

      <TouchableOpacity style={styles.buttonPrimary} onPress={handleCourses}>
        <Text style={styles.buttonText}>📚 Listado de Cursos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={handleLogout}>
        <Text style={styles.buttonText}>🚪 Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceLight[20],
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.secondary[60],
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textNeutral[50],
    marginBottom: 30,
  },
  buttonPrimary: {
    backgroundColor: colors.primary[60],
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary[60],
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: colors.surfaceLight[10],
    fontSize: 16,
    fontWeight: "600",
  },
});

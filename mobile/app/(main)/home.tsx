import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { styles } from "../../styles/styles";

export default function HomeScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };
  const goToChangePassword = () => {
    router.push("/(main)/profile/change-password");
  };

  const handleCourses = () => {
    router.push("/(courses)/coursesList");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido!</Text>

      <TouchableOpacity style={styles.buttonPrimary} onPress={handleCourses}>
        <Text style={styles.buttonText}>📚 Listado de Cursos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={handleLogout}>
        <Text style={styles.buttonText}>🚪 Cerrar Sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonSecondary} onPress={goToChangePassword}>
        <Text style={styles.buttonText}> Cambiar contraseña </Text>
      </TouchableOpacity>
    </View>
    
  );
}


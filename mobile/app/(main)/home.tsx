import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../../styles/styles";
import { useAuth } from "../../contexts/AuthContext";
import { colors } from "../../styles/colors";

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const logo = require("../../assets/images/mentora-logo-small.png");

  const goToProfilePage = () => {
    router.push("/(main)/profile/");
  };

  const handleCourses = () => {
    router.push("/(courses)/coursesList");
  };

  const goToNotifications = () => {
    router.push("/(main)/notifications");
  };

  const goToRecentActivity = () => {
    router.push("/(main)/recent-activity");
  };

  const goToChats = () => {
    router.push("/chats/");
  };

  const goToChangePassword = () => {
    router.push("/(main)/profile/change-password");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardMain}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>Mentora</Text>
        <Text style={styles.title}>¡Bienvenido{user?.name ? `, ${user.name}` : ""}!</Text>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleCourses}>
          <Text style={styles.buttonText}> Listado de Cursos </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToNotifications}>
          <Text style={styles.buttonText}> Notificaciones </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToRecentActivity}>
          <Text style={styles.buttonText}> Actividad reciente </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToChangePassword}>
          <Text style={styles.buttonText}> Cambiar contraseña </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToChats}>
          <Text style={styles.buttonText}> Chats </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToProfilePage}>
          <Text style={styles.buttonText}> Mi Perfil </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonSecondary,{ backgroundColor: colors.accent.danger[50] },]}onPress={handleLogout}>
          <Text style={styles.buttonText}> Cerrar sesión </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

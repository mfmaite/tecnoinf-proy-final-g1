import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { styles } from "../../styles/styles";

export default function HomeScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const logo = require("../../assets/images/mentora-logo-small.png");
  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };
  const goToChangePassword = () => {
    router.push("/(main)/profile/change-password");
  };
  const goToProfilePage = () => {
    router.push("/(main)/profile/");
  };
  const handleCourses = () => {
    router.push("/(courses)/coursesList");
  };
  const goToChats = () => {
    router.push("/chats/");
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardMain}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Mentora</Text>
        <Text style={styles.title}>¡Bienvenido!</Text>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleCourses}>
          <Text style={styles.buttonText}> Listado de Cursos </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToProfilePage}>
          <Text style={styles.buttonText}> Ir a perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={() => {router.push("/(main)/recent-activity");}}>
           <Text style={styles.buttonText}> Ir a actividad reciente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToChangePassword}>
          <Text style={styles.buttonText}> Cambiar contraseña </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToChats}>
          <Text style={styles.buttonText}> Chats </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogout}>
          <Text style={styles.buttonText}> Cerrar Sesión </Text>
        </TouchableOpacity>

      </View>
    </View>

  );
}


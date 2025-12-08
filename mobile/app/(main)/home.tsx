import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../../styles/styles";

export default function HomeScreen() {
  const router = useRouter();
  const logo = require("../../assets/images/mentora-logo-small.png");
  const goToProfilePage = () => {
    router.push("/(main)/profile/");
  };
  const handleCourses = () => {
    router.push("/(courses)/coursesList");
  };
  const goToChats = () => {
    router.push("/chats/");
  };
  const goToChangePassword = () => {
    router.push("/(main)/profile/change-password");
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardMain}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Mentora</Text>
        <Text style={styles.title}>¡Bienvenido!</Text>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleCourses}>
          <Text style={styles.buttonText}>Listado de Cursos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToChats}>
          <Text style={styles.buttonText}> Chats </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToProfilePage}>
          <Text style={styles.buttonText}>Mi Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={() => {router.push("/(main)/notifications");}}>
          <Text style={styles.buttonText}>Notificaciones</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToChangePassword}>
          <Text style={styles.buttonText}> Cambiar contraseña </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => {router.push("/(main)/recent-activity");}}>
           <Text style={styles.buttonText}>Mi actividad reciente</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
}


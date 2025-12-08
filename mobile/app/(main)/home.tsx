import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../../styles/styles";
import * as Notifications from "expo-notifications";
import { api } from "../../services/api";

export default function HomeScreen() {
  const router = useRouter();
  const logo = require("../../assets/images/mentora-logo-small.png");
  const goToProfilePage = () => {
    router.push("/(main)/profile/");
  };
  // Registra el token FCM del dispositivo
  const registerPushToken = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      const { data: token } = await Notifications.getDevicePushTokenAsync();
      if (!token) return;

      await api.post("/users/device-token", { token });
    } catch (e) {
      console.warn("[push] No se pudo registrar el token:", e);
    }
  };

  useEffect(() => {
    registerPushToken();
  }, []);
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

        <TouchableOpacity style={styles.buttonPrimary} onPress={() => {router.push("/(main)/notifications");}}>
          <Text style={styles.buttonText}>Notificaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => {router.push("/(main)/recent-activity");}}>
           <Text style={styles.buttonText}> Ir a actividad reciente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToChangePassword}>
          <Text style={styles.buttonText}> Cambiar contraseña </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleCourses}>
          <Text style={styles.buttonText}>Listado de Cursos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToChats}>
          <Text style={styles.buttonText}> Chats </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={goToProfilePage}>
          <Text style={styles.buttonText}>Mi Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={() => {router.push("/(main)/recent-activity");}}>
           <Text style={styles.buttonText}>Mi actividad reciente</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
}


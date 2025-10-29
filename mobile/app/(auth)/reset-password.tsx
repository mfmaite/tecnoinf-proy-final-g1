import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { API_URL } from "../../constants/config"; // Asegurate de tener esto configurado
import { styles as globalStyles } from "../../styles/styles";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!token) {
      Alert.alert("Error", "Token inválido o faltante.");
      return;
    }

    // Validaciones simples
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    // Validación de formato
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        "Contraseña inválida",
        "Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."
      );
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/users/reset-password`, {
        token,
        newPassword,
        confirmPassword,
      });

      console.log(" Response:", response.data);
      Alert.alert("Éxito", "Contraseña restablecida correctamente.", [
        {
          text: "Ir al login",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (error: any) {
      console.error(" Error al resetear:", error);
      const msg =
        error.response?.data?.message ||
        "Error al restablecer la contraseña. Inténtalo de nuevo.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Restablecer contraseña</Text>

      <TextInput
        placeholder="Nueva contraseña"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={globalStyles.input}
      />

      <TextInput
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={globalStyles.input}
      />

      <TouchableOpacity
        style={[globalStyles.buttonPrimary, loading && styles.disabledButton]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>
          {loading ? "Procesando..." : "Cambiar contraseña"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  disabledButton: {
    opacity: 0.6,
  },
});

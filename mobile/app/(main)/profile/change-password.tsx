import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { api } from "@/services/api";
import { router } from "expo-router";

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Por favor completá todos los campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas nuevas no coinciden.");
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        "Error de validación",
        "La nueva contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula y un número."
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/users/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (response.data.success) {
        Alert.alert("Éxito", "Contraseña cambiada correctamente.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "No se pudo cambiar la contraseña."
        );
      }
    } catch (error: any) {
      console.error("Error cambiando contraseña:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Ocurrió un error inesperado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6 text-center">
        Cambiar contraseña
      </Text>

      <Text className="text-base mb-2">Contraseña actual</Text>
      <TextInput
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
        className="border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="Contraseña actual"
      />

      <Text className="text-base mb-2">Nueva contraseña</Text>
      <TextInput
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        className="border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="Nueva contraseña"
      />

      <Text className="text-base mb-2">Confirmar nueva contraseña</Text>
      <TextInput
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        className="border border-gray-300 rounded-lg p-3 mb-6"
        placeholder="Confirmar nueva contraseña"
      />

      <TouchableOpacity
        onPress={handleChangePassword}
        disabled={loading}
        className={`rounded-lg p-4 ${loading ? "bg-gray-400" : "bg-blue-600"}`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-semibold">
            Cambiar contraseña
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

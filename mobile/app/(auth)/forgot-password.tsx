import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../services/api";
import { colors } from "../../styles/colors";
import { styles as globalStyles } from "../../styles/styles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const logo = require("../../assets/images/mentora-logo-small.png");
  const handleForgotPassword = async (): Promise<void> => {
    if (!email.trim()) {
      setError("Por favor ingresá tu correo electrónico");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.get("/users/password-recovery", { params: { email } });
      Alert.alert(
        "Solicitud enviada",
        "Si el correo existe, recibirás un email con instrucciones para restablecer tu contraseña."
      );

      router.push("/(auth)/login");
    } catch {
      setError("No se pudo enviar el correo. Intentá nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Mentora</Text>

          <Text style={styles.subtitle}>Recuperar contraseña</Text>

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enviar instrucciones</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.back}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[10],
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.surfaceLight[10],
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.secondary[60],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textNeutral[50],
    marginBottom: 24,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.surfaceLight[40],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: colors.surfaceLight[20],
  },
  button: {
    backgroundColor: colors.primary[60],
    borderRadius: 8,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  back: {
    color: colors.secondary[60],
    fontSize: 14,
    textDecorationLine: "underline",
  },
  error: {
    color: colors.accent.danger[50],
    marginBottom: 8,
    textAlign: "center",
  },
});

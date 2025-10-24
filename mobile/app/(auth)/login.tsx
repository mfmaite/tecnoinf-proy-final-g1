import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import logo from "../../assets/logo.svg";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [ci, setCi] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await login(ci, password);
      router.replace("/(main)/home");
    } catch (e) {
      setError("Credenciales inválidas");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Mentora</Text>

        <TextInput
          style={styles.input}
          placeholder="Cédula"
          placeholderTextColor="#999"
          value={ci}
          onChangeText={setCi}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#266C35" // $secondary-color-60
            />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  passwordContainer: {
    width: "100%",
    position: "relative",
  },
  passwordInput: {
    paddingRight: 40, // espacio para el ícono
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 14,
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
  forgot: {
    color: colors.secondary[60],
    fontSize: 14,
    textDecorationLine: "underline",
  },
  error: {
    color: colors.accent[40],
    marginBottom: 8,
    textAlign: "center",
  },
});

import React, { useState, useEffect } from "react";
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
import { styles as globalStyles }from "../../styles/styles"

export default function LoginScreen() {
  const { login,isAuthenticated } = useAuth();
  const router = useRouter();
  const logo = require("../../assets/images/mentora-logo-small.png");
  const [ci, setCi] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(main)/home");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    try {
      await login(ci, password);
      router.replace("/(main)/home");
    } catch {
      setError("Credenciales inválidas");
    }
  };

   return (
    <View style={localStyles.container}>
      <View style={localStyles.card}>
        <Image source={logo} style={localStyles.logo} resizeMode="contain" />
        <Text style={globalStyles.headerTitle}>Mentora</Text>
        <TextInput
          style={localStyles.input}
          placeholder="Cédula"
          placeholderTextColor="#999"
          value={ci}
          onChangeText={setCi}
        />


        <View style={localStyles.passwordContainer}>
          <TextInput
            style={[localStyles.input, { color: colors.textNeutral[50] }]}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={localStyles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color={colors.secondary[60]}
            />
          </TouchableOpacity>
        </View>

        {/* ERROR */}
        {error ? <Text style={globalStyles.error}>{error}</Text> : null}

        {/* BOTÓN LOGIN (usa botón global) */}
        <TouchableOpacity
          style={globalStyles.buttonPrimary}
          onPress={handleLogin}
        >
          <Text style={globalStyles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        {/* LINK RECUPERAR CONTRASEÑA */}
        <TouchableOpacity onPress={() => router.push("/forgot-password")}>
          <Text style={globalStyles.link}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
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
    width: 60,
    height: 60,
    marginBottom: 10,
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
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 14,
  },
});
import React, { useState, useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../styles/colors";
import { useAuth } from "../../contexts/AuthContext";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout } = useAuth();
  const isHome = segments.length === 1 && segments[0] === "home";

  const BOTTOM_BAR_HEIGHT = 76;

  function openRoute(path: string) {
    setMenuVisible(false);
    router.push(path);
  }

  function getTitleFromSegments(segs: string[]) {
    if (!segs || segs.length === 0) return "Inicio";
    const last = segs[segs.length - 1];
    switch (last) {
      case "home":
        return "Inicio";
      case "coursesList":
      case "courses":
        return "Cursos";
      case "participants":
        return "Participantes";
      case "viewProfile":
      case "viewPerfil":
        return "Participante";
      default:
        if (last && /^[a-zA-Z0-9-_]+$/.test(last) && last.length > 2) {
          return "Detalle del curso";
        }
        return String(last).charAt(0).toUpperCase() + String(last).slice(1);
    }
  }

  const headerTitle = getTitleFromSegments(segments);

  const headerMentora = () => (
    <TouchableOpacity
      onPress={() => router.push("/(main)/home")}
      style={localStyles.mentoraButton}
      activeOpacity={0.8}
    >
      <Text style={localStyles.mentoraText}>Mentora</Text>
    </TouchableOpacity>
  );

  async function handleLogout() {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Error en logout:", err);
    } finally {
      setMenuVisible(false);
    }
  }

  return (
    <>
      <View style={[localStyles.stackWrapper, { paddingBottom: BOTTOM_BAR_HEIGHT }]}>
        <Stack
          screenOptions={{
            headerBackVisible: !isHome,
            headerTitle: headerTitle,
            headerRight: headerMentora,
            headerTitleStyle: { color: colors.secondary[60], fontWeight: "700" },
            headerTintColor: colors.secondary[80],
          }}
        >
          {/* pantallas hijas */}
        </Stack>
      </View>

      <SafeAreaView style={localStyles.bottomWrapper}>
        <View style={localStyles.bottomBarRow}>
          <TouchableOpacity
            style={localStyles.menuBarButton}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={localStyles.menuBarText}>☰  Menú</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={localStyles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={localStyles.modalSheet} onPress={() => {}}>
            <View style={localStyles.modalContent}>
              <TouchableOpacity
                style={localStyles.menuButton}
                onPress={() => openRoute("/(main)/home")}
              >
                <Text style={localStyles.menuButtonText}>Inicio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={localStyles.menuButton}
                onPress={() => openRoute("/(courses)/coursesList")}
              >
                <Text style={localStyles.menuButtonText}>Cursos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={localStyles.menuButton}
                onPress={() => openRoute("/(main)/profile")}
              >
                <Text style={localStyles.menuButtonText}>Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[localStyles.menuButton, localStyles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={localStyles.menuButtonText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const localStyles = StyleSheet.create({
  stackWrapper: {
    flex: 1,
    backgroundColor: "transparent",
  },
  mentoraButton: {
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  mentoraText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary[90],
  },
  bottomWrapper: {
    width: "100%",
    backgroundColor: "transparent",
  },
  bottomBarRow: {
    width: "100%",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === "android" ? 12 : 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e6e6e6",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 4,
    alignItems: "center",
  },
  menuBarButton: {
    width: "100%",
    backgroundColor: colors.primary[40],
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  menuBarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalSheet: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  modalContent: {
    backgroundColor: colors.primary[30],
    padding: 16,
    paddingBottom: 32,
  },
  menuButton: {
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: colors.primary[40],
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: colors.accent.danger[50],
  },
  menuButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
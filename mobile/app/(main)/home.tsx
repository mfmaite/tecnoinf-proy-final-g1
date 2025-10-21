import { View, Text, Button } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };
 const handleAltaUsuario = () => {
    router.replace('/(user)/altaUsuarios');
  };
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>¡Bienvenido!</Text>
      <Button title="Alta Usuario" onPress={handleAltaUsuario} />
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}

import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../../../../styles/styles";

export default function ProfileTab() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => router.push("/(main)/profile/")}
      >
        <Text style={styles.buttonText}>Ir a mi perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => router.push("/(main)/profile/change-password")}
      >
        <Text style={styles.buttonText}>Cambiar contraseña</Text>
      </TouchableOpacity>
    </View>
  );
}

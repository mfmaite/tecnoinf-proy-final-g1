import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../../../styles/styles";

export default function CoursesTab() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cursos</Text>

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => router.push("/(courses)/coursesList")}
      >
        <Text style={styles.buttonText}>Ir al listado de cursos</Text>
      </TouchableOpacity>
    </View>
  );
}

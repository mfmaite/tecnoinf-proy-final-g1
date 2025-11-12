import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../../styles/colors";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Pantalla en blanco - sin contenido visible */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[10],
  },
});
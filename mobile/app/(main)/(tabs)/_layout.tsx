// app/(main)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* CURSOS */}
      <Tabs.Screen
        name="courses"
        options={{
          title: "Cursos",
          href: "/(main)/(courses)/coursesList",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />

      {/* PERFIL */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          href: "/(main)/profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}

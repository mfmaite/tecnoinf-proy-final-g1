import { Stack } from "expo-router";
import { styles } from "../../styles/styles";
import { useNavigation } from "@react-navigation/native";


export default function ListLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="coursesList"
        options={{
          title: "Cursos",
          headerTitleStyle: styles.title, 
        }}
      />
      <Stack.Screen
        name="[courseId]"
        options={({ route }: any) => ({
          title: route?.params?.courseName ?? "Detalle del curso",
          headerTitleStyle: styles.title, 
        })}
      />
      <Stack.Screen
        name="participants"
        options={({ route }: any) => ({
          title: route?.params?.courseName ?? "Participantes",
          headerTitleStyle: styles.title, 
        })}
      />
    </Stack>
  );
}
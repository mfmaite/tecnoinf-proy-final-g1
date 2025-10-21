import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { createUser, createUsersFromCSV } from "../../services/userService";

export default function AltaUsuarios() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [ci, setCi] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("ESTUDIANTE");
  const [csvFile, setCsvFile] = useState<any>(null);

  const handleSelectCSV = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "text/csv",
    });
    if (result.type === "success") setCsvFile(result);
  };

  const handleSubmit = async () => {
    try {
      if (csvFile) {
        await createUsersFromCSV(csvFile);
        Alert.alert("Usuarios cargados correctamente");
      } else {
        await createUser({
          name: nombre + " " + apellido,
          ci,
          email,
          password,
          role: rol,
        });
        Alert.alert("Usuario creado correctamente");

        // Limpiar campos después del alta
        setNombre("");
        setApellido("");
        setCi("");
        setEmail("");
        setPassword("");
        setRol("ESTUDIANTE");
        setCsvFile(null);
      }
    } catch (e: any) {
      console.log(e.response?.data || e.message);
      Alert.alert(
        "Error",
        e.response?.data?.message || "No se pudo crear el usuario"
      );
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      {/* Botón atrás con Expo Router */}
      <Button
        title="← Atrás"
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            // Si no hay historial, ir a una pantalla por defecto, por ejemplo home
            router.replace("/home");
          }
        }}
      />
      <Text style={{ fontSize: 20, marginBottom: 10 }
      }>Alta de usuarios</Text>

      <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput placeholder="Apellido" value={apellido} onChangeText={setApellido} />
      <TextInput
        placeholder="Documento de identidad"
        value={ci}
        onChangeText={setCi}
      />
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Contraseña inicial"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Picker
        selectedValue={rol}
        onValueChange={(itemValue) => setRol(itemValue)}
        style={{ width: 200, height: 50 }}
      >
        <Picker.Item label="ESTUDIANTE" value="ESTUDIANTE" />
        <Picker.Item label="PROFESOR" value="PROFESOR" />
        <Picker.Item label="ADMIN" value="ADMIN" />
      </Picker>

      <Button title="Seleccionar archivo CSV" onPress={handleSelectCSV} />
      {csvFile && <Text>Archivo seleccionado: {csvFile.name}</Text>}

      <Button title="Crear usuario(s)" onPress={handleSubmit} />
    </ScrollView>
  );
}

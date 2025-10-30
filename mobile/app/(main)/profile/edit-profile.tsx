// app/(main)/profile/edit-profile.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { colors } from "../../../styles/colors";
import { styles as globalStyles } from "../../../styles/styles";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [description, setDescription] = useState(user?.description || "");
  const [pictureUrl, setPictureUrl] = useState(user?.pictureUrl || "");
  const [newImage, setNewImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a tus fotos para cambiar el avatar."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setPictureUrl(result.assets[0].uri);
      setNewImage(true);
    }
  };

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Por favor completá todos los campos obligatorios.");
      return;
    }

    try {
      setLoading(true);

      if (newImage && pictureUrl) {
        // si hay una imagen nueva, usamos FormData
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("description", description);

        const filename = pictureUrl.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("picture", {
          uri: pictureUrl,
          name: filename,
          type,
        } as any);
      }

      // await updateUser(payload, newImage); // `newImage` indica si es multipart
      Alert.alert("Éxito", "Tu perfil ha sido actualizado.");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  const goToChangePassword = () => {
    router.push("/(main)/profile/change-password")
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Editar Perfil</Text>

      <TouchableOpacity onPress={pickImage}>
        {pictureUrl ? (
          <Image source={{ uri: pictureUrl }} style={localStyles.avatar} />
        ) : (
          <View style={[localStyles.avatar, localStyles.avatarPlaceholder]}>
            <Text style={localStyles.avatarInitial}>
              {name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
        )}
        <Text style={localStyles.changePhotoText}>Cambiar foto</Text>
      </TouchableOpacity>

      <View style={localStyles.form}>
        <Text style={localStyles.label}>Nombre</Text>
        <TextInput
          style={localStyles.input}
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
        />

        <Text style={localStyles.label}>Email</Text>
        <TextInput
          style={localStyles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="tu@email.com"
        />

        <Text style={localStyles.label}>Descripción</Text>
        <TextInput
          style={[localStyles.input, { height: 100, textAlignVertical: "top" }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Contanos algo sobre vos..."
          multiline
        />
      </View>

      <TouchableOpacity
        style={[globalStyles.buttonPrimary, loading && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={globalStyles.buttonText}>Guardar cambios</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.buttonSecondary}
        onPress={goToChangePassword}
      >
        <Text style={globalStyles.buttonText}>Cambiar contraseña</Text>
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceLight[30],
    marginBottom: 8,
    alignSelf: "center",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 40,
    color: colors.textNeutral[10],
    fontWeight: "700",
  },
  changePhotoText: {
    color: colors.primary[60],
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  form: {
    width: "100%",
    backgroundColor: colors.surfaceLight[10],
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontWeight: "600",
    color: colors.textNeutral[40],
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surfaceLight[40],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textNeutral[50],
    backgroundColor: colors.surfaceLight[20],
  },
});

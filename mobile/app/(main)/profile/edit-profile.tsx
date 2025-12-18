import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { colors } from "../../../styles/colors";
import { styles as globalStyles } from "../../../styles/styles";
import { updateUserProfile } from "../../../services/userService";
import { UserProfilePicture } from "@/components/user-profile-picture/user-profile-picture";

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
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
      mediaTypes: ["images"],
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const uri = result.assets[0].uri;
    const filename = uri.split("/").pop() || "";
    const extension = filename.split(".").pop()?.toLowerCase();

    if (!["jpg", "jpeg", "png"].includes(extension || "")) {
      Alert.alert(
        "Formato no válido",
        "Solo se permiten imágenes en formato JPG o PNG."
      );
      return;
    }

    setPictureUrl(uri);
    setNewImage(true);
  };

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Por favor completá todos los campos obligatorios.");
      return;
    }

    try {
      setLoading(true);

      let picture: any = undefined;

      if (newImage && pictureUrl) {
        const filename = pictureUrl.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        picture = {
          uri: pictureUrl,
          name: filename,
          type,
        };
      }

      const updatedUser = await updateUserProfile({
        name,
        email,
        description,
        picture,
      });

      await updateUser({
        ...updatedUser,
        description: updatedUser.description ?? undefined,
        pictureUrl: updatedUser.pictureUrl ?? undefined,
      });

      Alert.alert("Éxito", "Tu perfil ha sido actualizado.");
      router.back();
    } catch (error) {
      console.error("[EditProfile] Error actualizando perfil:", error);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>

      <TouchableOpacity onPress={pickImage}>
        <View style={{ alignItems: "center" }}>
          <UserProfilePicture name={user?.name || "?"} pictureUrl={pictureUrl ?? undefined} size="3xl" />
        </View>
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
  changePhotoText: {
    color: colors.primary[60],
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  removePhotoText: {
    color: colors.accent.danger[50],
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

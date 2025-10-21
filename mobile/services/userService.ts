import { api } from './api';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import * as FileSystem from 'expo-file-system';

export const createUser = async (userData: any) => {
    try {
        const response = await api.post("/users", userData);
        return response.data;
    } catch (e: any) {
        const data = e.response?.data;
        let message = "No se pudo crear el usuario";

        if (Array.isArray(data)) {
          // Si es un array, lo concatenamos
          message = data.join("\n");
        } else if (typeof data === "object") {
          // Si es un objeto, chequeo si tiene subcampo 'data' con errores específicos
          if (data.data && typeof data.data === "object") {
            // Convertimos los pares clave/valor en texto legible
            const detalles = Object.entries(data.data)
              .map(([campo, error]) => `• ${error}`)
              .join("\n");
            message = `${data.message || "Error de validación"}:\n${detalles}`;
          } else if (data.message) {
            message = data.message;
          }
        } else if (typeof data === "string") {
          message = data;
        }
        console.log("Error al crear usuario:", message);
        throw new Error(message);
      }

};


export const createUsersFromCSV = async (csvFile: any) => {
    const fileUri = csvFile.uri;
    const fileContent = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });

    const formData = new FormData();
    formData.append('file',
    {
    uri: fileUri,
    name: csvFile.name,
    type: 'text/csv',
    } as any);

    const response = await api.post('/users/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    });
  return response.data;
};

export const getAuthenticatedUser = async () => {
    try {
        const response = await api.get('/test/protected');
        return response.data.data;
    } catch (error: any) {
        console.log("Error al obtener usuario autenticado:", error.response?.data || error.message);
    throw error;
  }
};



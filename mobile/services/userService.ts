import { api } from "./api";

interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

/**
 * 🔐 Cambia la contraseña del usuario autenticado.
 * El token JWT se agrega automáticamente por el interceptor.
 */
export const changePassword = async (
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> => {
  try {
    const { data } = await api.post<ApiResponse<unknown>>(
      "/users/change-password",
      { oldPassword, newPassword, confirmPassword }
    );

    if (!data.success) {
      throw new Error(data.message || "Error al cambiar la contraseña.");
    }
  } catch (error: any) {
    console.error("[changePassword] Error:", error);
    throw new Error(
      error.response?.data?.message || "No se pudo cambiar la contraseña."
    );
  }
};

/**
 * 🧩 Actualiza el perfil del usuario autenticado.
 * Maneja tanto actualizaciones con imagen nueva como eliminación de imagen.
 */
export async function updateUserProfile(data: {
  name: string;
  email: string;
  description: string;
  picture?: any | null;
}) {
  let response;

  // 🗑️ Si el usuario quitó la imagen
  if (data.picture === null) {
    // Enviamos form-data sin campo "picture" para que el backend la remueva
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("description", data.description || "");
    formData.append("picture", ""); // campo vacío en vez de null

    response = await api.put<ApiResponse<any>>("/users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // 🖼️ Si hay una nueva imagen
  else if (data.picture) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("description", data.description || "");
    formData.append("picture", data.picture);

    response = await api.put<ApiResponse<any>>("/users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // 🧾 Solo texto (sin cambios de imagen)
  else {
    response = await api.put<ApiResponse<any>>("/users", {
      name: data.name,
      email: data.email,
      description: data.description || "",
    });
  }

  if (!response.data.success) {
    throw new Error(response.data.message || "Error al actualizar usuario.");
  }

  return response.data.data;
}

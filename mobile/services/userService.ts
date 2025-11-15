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

export async function updateUserProfile(data: {
  name: string;
  email: string;
  description: string;
  picture?: any | null;
}) {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("description", data.description || "");

  if (data.picture && data.picture !== null) {
    formData.append("picture", data.picture);
  }

  const response = await api.put<ApiResponse<any>>("/users", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || "Error al actualizar usuario.");
  }

  return response.data.data;
}

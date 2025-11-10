import { api } from "./api";

interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

/**
 * Cambia la contraseña del usuario autenticado.
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

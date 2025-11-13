import { api } from "./api";

interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

export interface UserActivity {
  id: number;
  type: string;
  description: string;
  link: string;
  createdDate: string;
}

/**
 * Cambiar contraseña (TU CÓDIGO ORIGINAL)
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
 * 🔹 NUEVO: Obtener actividades recientes del usuario
 */
export const getUserActivities = async (userCi: string): Promise<UserActivity[]> => {
  try {
    const { data } = await api.get<ApiResponse<UserActivity[]>>(
      `/users/${userCi}/activities`
    );

    if (!data.success) {
      throw new Error(data.message || "Error al obtener actividades.");
    }

    return data.data;
  } catch (error: any) {
    console.error("[getUserActivities] Error:", error);
    throw new Error(
      error.response?.data?.message || "No se pudieron obtener las actividades."
    );
  }
};

import { api } from "./api";
import * as SecureStore from "expo-secure-store";

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

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  description?: string;
  picture?: { uri: string; name: string; type: string } | null;
}

export interface UserDto {
  ci: string;
  name: string;
  email: string;
  description?: string | null;
  pictureUrl?: string | null;
  role: string;
}

export const updateUserProfile = async (payload: UpdateUserPayload): Promise<UserDto> => {
  try {
    const form = new FormData();
    if (payload.name !== undefined) form.append("name", payload.name);
    if (payload.email !== undefined) form.append("email", payload.email);
    if (payload.description !== undefined) form.append("description", payload.description);
    if (payload.picture !== undefined) {
      if (payload.picture) {
        // @ts-expect-error - React Native FormData acepta { uri, name, type }
        form.append("picture", payload.picture);
      }
    }

    const { data } = await api.put<ApiResponse<UserDto>>("/users", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!data.success || !data.data) {
      throw new Error(data.message || "Error al actualizar perfil.");
    }
    try {
      await SecureStore.setItemAsync("user", JSON.stringify(data.data));
    } catch {}
    return data.data;
  } catch (error: any) {
    console.error("[updateUserProfile] Error:", error);
    throw new Error(
      error.response?.data?.message || "No se pudo actualizar el perfil."
    );
  }
};

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

export const getUserActivities = async (userCi: string): Promise<UserActivity[]> => {
  try {
    const { data } = await api.get<ApiResponse<UserActivity[]>>(
      `/users/activities`
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

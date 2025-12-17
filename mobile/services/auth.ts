import { api } from "./api";
interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

interface LoginResponse {
  token: string;
  user: {
    ci: string;
    name: string;
    email: string;
    description?: string;
    pictureUrl?: string;
    role: "ADMIN" | "PROFESOR" | "ESTUDIANTE" | string;
  };
}

export async function login(ci: string, password: string) {
  try {
    const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", {
      ci,
      password,
    });

    if (!data.success) {
      throw new Error(data.message || "Error de autenticación");
    }

    return {
      token: data.data.token,
      user: data.data.user,
    };
  } catch (error: any) {
    console.error("[login] Error:", error);
    throw new Error(
      error.response?.data?.message ||
        "No se pudo iniciar sesión. Verificá tus credenciales."
    );
  }
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> {
  try {
    const { data } = await api.post<ApiResponse<unknown>>("/users/change-password", {
      oldPassword,
      newPassword,
      confirmPassword,
    });

    if (!data.success) {
      throw new Error(data.message || "Error al cambiar contraseña");
    }
  } catch (error: any) {
    console.error("[changePassword] Error:", error);
    throw new Error(
      error.response?.data?.message ||
        "No se pudo cambiar la contraseña. Intentalo nuevamente."
    );
  }
}

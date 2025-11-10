import { api } from "./api";

/**
 * Inicia sesión de un usuario y devuelve el token y los datos del usuario.
 */
export async function login(ci: string, password: string) {
  const response = await api.post("/auth/login", { ci, password });
  const { success, message, data } = response.data;
  if (!success) {
    throw new Error(message || "Error de autenticación");
  }
  const { token, user } = data;
  return { token, user };
}

/**
 * Cambia la contraseña del usuario autenticado.
 * Requiere token JWT en el header Authorization.
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string,
  token: string
): Promise<void> {
  try {
    const response = await api.post(
      "/users/change-password",
      {
        oldPassword,
        newPassword,
        confirmPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Error al cambiar contraseña");
    }
  } catch (error: any) {
    console.error("[changePassword] Error:", error);
    throw new Error(
      error.response?.data?.message || "Error al cambiar la contraseña"
    );
  }
}

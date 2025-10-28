import { api } from "./api";

export async function login(ci: string, password: string) {
  const response = await api.post("/auth/login", { ci, password });
  const { success, message, data } = response.data;
  if (!success) {
    throw new Error(message || "Error de autenticación");
  }
  const { token, user } = data;
  return { token, user };
}

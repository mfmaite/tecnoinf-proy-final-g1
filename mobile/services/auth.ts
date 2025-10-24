import { api } from "./api";

export async function login(ci: string, password: string) {
  const response = await api.post("/auth/login", { ci, password });

  if (!response.data.success) {
    throw new Error(response.data.message || "Error de autenticación");
  }

  const { token, user } = response.data.data;

  return { token, user };
}

import { api } from "./api";

export async function login(ci: string, password: string) {


  try {
    const response = await api.get("/courses");
    setCourses(response.data.data || []);
  } catch (err) {
    console.error("Error al obtener cursos:", err);
    setError("No se pudieron cargar los cursos.");
  } finally {
    setLoading(false);
  }

  const { token, user } = response.data.data;

  return { token, user };
}

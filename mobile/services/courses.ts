import { api } from "./api";

// ─────────────────────────────────────
// 📌 Tipos mínimos que este servicio usa
// ─────────────────────────────────────
export interface CourseData {
  id: string;
  name?: string;
  createdDate?: string | null;
  forums?: Forum[];
}

export interface Forum {
  id: string;
  type: string;
  courseId: string;
  createdAt: string;
}

export interface ContentListItem {
  id: number;
  title?: string;
  type: "simpleContent" | "quiz" | "evaluation";
  createdDate?: string | null;
  dueDate?: string | null;
}

// Respuesta de getCourseById
export interface CourseResponse {
  course: CourseData;
  contents: ContentListItem[];
}

// 🔹 Estructura genérica de respuesta del backend
interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

// ─────────────────────────────────────
// 📘 GET /courses/:courseId
// Devuelve el curso + listado de contenidos
// (pero NO detalles de cada contenido)
// ─────────────────────────────────────
export async function getCourseById(courseId: string): Promise<CourseResponse> {
  try {
    const response = await api.get<ApiResponse<any>>(
      `/courses/${encodeURIComponent(courseId)}`
    );

    const { success, message, data } = response.data;
    if (!success) throw new Error(message || "Error al obtener curso");

    const c = data.course;
    const course: CourseData = {
      id: String(c.id),
      name: c.name,
      createdDate: c.createdDate ?? null,
      forums: data.forums || [],
    };

    const contents: ContentListItem[] = (data.contents || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      createdDate: item.createdDate ?? null,
      dueDate: item.dueDate ?? null,
    }));

    return { course, contents };
  } catch (error: any) {
    console.error("[getCourseById] Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        "No se pudo obtener la información del curso."
    );
  }
}

// ─────────────────────────────────────
// 🧾 GET /courses
// Lista de cursos sin contenidos
// ─────────────────────────────────────
export interface CourseListItem {
  id: string;
  name?: string;
  createdDate?: string | null;
}

export async function getCourses(): Promise<CourseListItem[]> {
  try {
    const response = await api.get<ApiResponse<CourseListItem[]>>("/courses");

    const { success, data, message } = response.data;
    if (!success) throw new Error(message || "Error al obtener cursos");

    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error("[getCourses] Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "No se pudieron listar los cursos."
    );
  }
}

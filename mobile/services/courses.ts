import { api } from "./api";

// ─────────────────────────────────────
// 🧩 Tipos base
// ─────────────────────────────────────
export type ContentType =
  | "simpleContent"
  | "quiz"
  | "evaluation";

export interface Content {
  id: number;
  title?: string;
  content?: string | null;
  type: ContentType;
  createdDate?: string | null;

  fileName?: string | null;
  fileUrl?: string | null;

  dueDate?: string | null; 
  courseId?: string | null;
}

export interface ForumPost {
  id: number;
  authorCi: string;
  authorName: string;
  message: string;
  createdDate: string;
}

export interface Forum {
  id: string;
  type: string;
  courseId: string;
  createdAt: string;
  posts?: ForumPost[];
}

export interface CourseData {
  id: string;
  name?: string;
  createdDate?: string | null;
  forums?: Forum[];
}

export interface CourseResponse {
  course: CourseData;
  contents: Content[];
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
// ─────────────────────────────────────
export async function getCourseById(courseId: string): Promise<CourseResponse> {
  try {
    const response = await api.get<ApiResponse<any>>(
      `/courses/${encodeURIComponent(courseId)}`
    );

    const { success, message, data } = response.data;
    if (!success) {
      throw new Error(message || "Error al obtener curso.");
    }

    if (!data || !data.course) {
      throw new Error("Formato inesperado del servidor.");
    }

    const c = data.course;
    const course: CourseData = {
      id: String(c.id),
      name: c.name,
      createdDate: c.createdDate ?? null,
      forums: data.forums || c.forums || [],
    };

    const contents: Content[] = (data.contents || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      content: c.content ?? null,
      type: c.type,                     // ✔ tipo real
      createdDate: c.createdDate ?? null,

      // simpleContent
      fileName: c.fileName ?? null,
      fileUrl: c.fileUrl ?? null,

      // quiz + evaluation
      dueDate: c.dueDate ?? null,
      courseId: c.courseId ?? null,
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
// ─────────────────────────────────────
export interface CourseListItem {
  id: string;
  name?: string;
  createdDate?: string | null;
}

export const getCourses = async (): Promise<CourseListItem[]> => {
  try {
    const response = await api.get<ApiResponse<CourseListItem[]>>("/courses");

    const { success, message, data } = response.data;
    if (!success) {
      throw new Error(message || "Error al obtener cursos.");
    }

    // ✅ Aseguramos siempre un array, aunque venga vacío
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error("[getCourses] Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "No se pudieron listar los cursos."
    );
  }
};

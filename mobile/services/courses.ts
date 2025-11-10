import { api } from "./api";

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

export interface Content {
  id: number;
  title?: string;
  content?: string;
  fileName?: string | null;
  fileUrl?: string | null;
  createdDate?: string | null;
}

export interface CourseResponse {
  course: CourseData;
  contents: Content[];
}

export async function getCourseById(courseId: string): Promise<CourseResponse> {
  const base =
    typeof (api as any).getUri === "function"
      ? (api as any).getUri()
      : (api as any).getUri ?? (api as any).defaults?.baseURL ?? "";

  const url = `${base.replace(/\/+$/, "")}/courses/${encodeURIComponent(courseId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Error al obtener curso (${res.status})`);
  }

  const text = await res.text();
  let parsed: any;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Respuesta no es JSON válido.");
  }

  // ✅ el backend devuelve los foros en data.forums, no dentro de course
  const d = parsed.data;
  if (!d || !d.course) {
    throw new Error("Formato inesperado del servidor.");
  }

  const c = d.course;
  const course: CourseData = {
    id: String(c.id),
    name: c.name,
    createdDate: c.createdDate ?? null,
    forums: d.forums || c.forums || [], // ✅ esta línea es clave
  };

  const contents: Content[] = d.contents || [];

  return { course, contents };
}

export interface CourseListItem {
  id: string;
  name?: string;
  createdDate?: string | null;
}

export const getCourses = async (): Promise<CourseListItem[]> => {
  try {
    const response = await api.get("/courses");
    return response.data.data || [];
  } catch (err) {
    console.error("Error en getCourses:", err);
    throw err;
  }
};

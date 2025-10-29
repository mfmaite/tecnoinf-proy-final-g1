import { api } from "./api";
export interface CourseData {
  id: string;
  name?: string;
  createdDate?: string | null;
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

  const url = `${base.replace(/\/+$/,"")}/courses/${encodeURIComponent(courseId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json, application/xml, text/*",
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }
  try {
    const parsed = JSON.parse(text);

    let course: CourseData | null = null;
    let contents: Content[] = [];

  if (parsed.course) {
      course = parsed.course;
      contents = parsed.contents || [];
    } else if (parsed.data) {
      if (Array.isArray(parsed.data)) {
        const found = parsed.data.find((c: any) => String(c.id) === String(courseId));
        if (found) {
          course = {
            id: String(found.id),
            name: found.name,
            createdDate: found.createdDate ?? null,
          };
        }
      } else if (typeof parsed.data === "object" && parsed.data !== null) {
        const d = parsed.data;
        if (d.course) {
          const c = d.course;
          course = {
            id: String(c.id),
            name: c.name,
            createdDate: c.createdDate ?? null,
          };
          contents = d.contents || [];
        } else {
          course = {
            id: String(d.id),
            name: d.name,
            createdDate: d.createdDate ?? null,
          };
          contents = d.contents || [];
        }
      }
    } else {
      if (parsed.id) {
        course = {
          id: String(parsed.id),
          name: parsed.name,
          createdDate: parsed.createdDate ?? null,
        };
        contents = parsed.contents || [];
      }
    }

    if (!course) {
      console.warn("[getCourseById] No se pudo extraer el curso del JSON parseado:", parsed);
      throw new Error("Respuesta válida pero no contiene datos del curso. Revisa los logs.");
    }

    return { course, contents };
  } catch (err) {
    console.error("[getCourseById] Error al parsear respuesta:", err);
    throw new Error("Respuesta no es JSON válido o formato inesperado. Revisa RESPONSE TEXT en la consola.");
  }
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

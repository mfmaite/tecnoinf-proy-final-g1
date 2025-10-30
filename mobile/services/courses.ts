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
  // Resolver base URL seguro (compatible con axios instance que tenga getUri o defaults.baseURL)
  const base =
    typeof (api as any).getUri === "function"
      ? (api as any).getUri()
      : (api as any).getUri ?? (api as any).defaults?.baseURL ?? "";

  const url = `${base.replace(/\/+$/,"")}/courses/${encodeURIComponent(courseId)}`;
  //console.log("[getCourseById] REQUEST URL:", url);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json, application/xml, text/*",
      "Content-Type": "application/json",
    },
  });

  //console.log("[getCourseById] RESPONSE STATUS:", res.status, res.statusText);
  //console.log("[getCourseById] RESPONSE HEADERS:", Array.from(res.headers.entries()));

  const text = await res.text();
  //console.log("[getCourseById] RESPONSE TEXT:", text);

  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }

  // Intentar parsear JSON y soportar distintos shapes de respuesta
  try {
    const parsed = JSON.parse(text);

    let course: CourseData | null = null;
    let contents: Content[] = [];

  if (parsed.course) {
      // formato { course: {...}, contents: [...] } en top-level
      course = parsed.course;
      contents = parsed.contents || [];
    } else if (parsed.data) {
      // formato { data: ... } puede ser objeto (curso), array (listado) o { course, contents }
      if (Array.isArray(parsed.data)) {
        // si backend devolvió listado, intentar encontrar el curso por id
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
        // Manejar caso data.course (estructura que devuelve tu backend en Postman)
        if (d.course) {
          const c = d.course;
          course = {
            id: String(c.id),
            name: c.name,
            createdDate: c.createdDate ?? null,
            forums: c.forums || [],
          };
          contents = d.contents || [];
        } else {
          // data es directamente el curso
          course = {
            id: String(d.id),
            name: d.name,
            createdDate: d.createdDate ?? null,
          };
          contents = d.contents || [];
        }
      }
    } else {
      // intentar casos menos comunes: respuesta directa con campos del curso
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

// Traer todos los cursos
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

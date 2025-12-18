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
    type?: "simpleContent" | "evaluation" | "quiz";
    dueDate?: string | null;
  }

  export interface CourseResponse {
    course: CourseData;
    contents: Content[];
  }

  export type ContentType = "simpleContent" | "evaluation" | "quiz";

  export interface Participant {
  ci: string;
  name: string;
  email?: string | null;
  description?: string | null;
  pictureUrl?: string | null;
  role?: string | null;
  finalGrade?: number | null;
}

  interface ApiResponse<T> {
    success: boolean;
    status?: number;
    message?: string;
    data: T;
  }

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

      const contents: Content[] = data.contents || [];

      return { course, contents };
    } catch (error: any) {
      console.error("[getCourseById] Error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message ||
          "No se pudo obtener la información del curso."
      );
    }
  }

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

      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("[getCourses] Error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "No se pudieron listar los cursos."
      );
    }
  };

  export async function getContentByType(
    courseId: string,
    type: ContentType,
    contentId: string | number
  ): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/courses/${encodeURIComponent(courseId)}/contents/${type}/${encodeURIComponent(
          String(contentId)
        )}`
      );
      const { success, message, data } = response.data;
      if (!success || !data) {
        throw new Error(message || "No se pudo obtener el contenido.");
      }
      return data;
    } catch (error: any) {
      console.error("[getContentByType] Error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "No se pudo obtener el contenido."
      );
    }
  }

  export async function getCourseParticipants(
    courseId: string
  ): Promise<Participant[]> {
    try {
      const response = await api.get<ApiResponse<Participant[]>>(
        `/courses/${encodeURIComponent(courseId)}/participants`
      );

      const { success, message, data } = response.data;

      if (!success) {
        throw new Error(message || "Error al obtener participantes.");
      }

      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error(
        "[getCourseParticipants] Error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message ||
          "No se pudo obtener la lista de participantes."
      );
    }
  }

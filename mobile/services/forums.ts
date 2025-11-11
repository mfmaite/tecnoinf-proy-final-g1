import { api } from "./api";

// ──────────────────────────────
// Tipos base
// ──────────────────────────────
export interface ForumPost {
  id: number;
  authorCi: string;
  authorName: string;
  authorPictureUrl?: string | null;
  message: string;
  createdDate: string;
}

export interface NewPostPayload {
  message: string;
}

// Respuesta genérica del backend
interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

// ──────────────────────────────
// GET /forum/:forumId
// ──────────────────────────────
export async function getForumPosts(forumId: string): Promise<ForumPost[]> {
  try {
    const { data } = await api.get<ApiResponse<any>>(
      `/forum/${encodeURIComponent(forumId)}`
    );

    if (!data.success) {
      throw new Error(data.message || "Error al obtener posts del foro.");
    }

    // El backend a veces devuelve posts en data.posts o directamente en data
    const posts: ForumPost[] = data.data?.posts || data.data || [];
    return posts;
  } catch (error: any) {
    console.error("[getForumPosts] Error:", error);
    throw new Error(
      error.response?.data?.message ||
        "No se pudieron obtener los posts del foro."
    );
  }
}

// ──────────────────────────────
// POST /forum/:forumId
// ──────────────────────────────
export async function createForumPost(
  forumId: string,
  payload: NewPostPayload
): Promise<ForumPost> {
  try {
    const { data } = await api.post<ApiResponse<ForumPost>>(
      `/forum/${encodeURIComponent(forumId)}`,
      payload
    );

    if (!data.success) {
      throw new Error(data.message || "Error al publicar mensaje.");
    }

    return data.data;
  } catch (error: any) {
    console.error("[createForumPost] Error:", error);
    throw new Error(
      error.response?.data?.message || "No se pudo publicar el mensaje."
    );
  }
}

// ──────────────────────────────
// PUT /post/:postId
// ──────────────────────────────
export async function updateForumPost(
  postId: number,
  payload: NewPostPayload
): Promise<ForumPost> {
  try {
    const { data } = await api.put<ApiResponse<ForumPost>>(
      `/post/${encodeURIComponent(postId)}`,
      payload
    );

    if (!data.success) {
      throw new Error(data.message || "Error al editar post.");
    }

    return data.data;
  } catch (error: any) {
    console.error("[updateForumPost] Error:", error);
    throw new Error(
      error.response?.data?.message || "No se pudo editar el post."
    );
  }
}

// ──────────────────────────────
// DELETE /post/:postId
// ──────────────────────────────
export async function deleteForumPost(postId: number): Promise<void> {
  try {
    const { data } = await api.delete<ApiResponse<unknown>>(
      `/post/${encodeURIComponent(postId)}`
    );

    if (!data.success) {
      throw new Error(data.message || "Error al eliminar post.");
    }
  } catch (error: any) {
    console.error("[deleteForumPost] Error:", error);
    throw new Error(
      error.response?.data?.message || "No se pudo eliminar el post."
    );
  }
}

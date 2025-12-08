import { api } from "./api";

// ──────────────────────────────
// Tipos base
// ──────────────────────────────
export interface Post {
  id: number;
  authorCi: string;
  authorName: string;
  authorPictureUrl?: string | null;
  message: string;
  createdDate: string;
}

export interface ForumMinimal {
  id: string;
  type: string;
  courseId: string;
}

export interface PostDetail {
  forum: ForumMinimal;
  post: Post;
  responses: Post[];
}

interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

// ──────────────────────────────
// GET /post/:postId
// ──────────────────────────────
export async function getPostById(postId: string): Promise<PostDetail> {
  try {
    const { data } = await api.get<ApiResponse<PostDetail>>(
      `/post/${encodeURIComponent(postId)}`
    );

    if (!data.success) {
      throw new Error(data.message || "Error al obtener post.");
    }

    return data.data;
  } catch (error: any) {
    console.error("[getPostById] Error:", error);
    throw new Error(
      error.response?.data?.message || "No se pudo obtener el post."
    );
  }
}

// ──────────────────────────────
// POST /post/:postId/response
// ──────────────────────────────
export async function createResponse(
  postId: string,
  message: string
): Promise<Post> {
  try {
    const { data } = await api.post<ApiResponse<Post>>(
      `/post/${encodeURIComponent(postId)}/response`,
      { message }
    );

    if (!data.success) {
      throw new Error(data.message || "Error al responder.");
    }

    return data.data;
  } catch (error: any) {
    console.error("[createResponse] Error:", error);
    throw new Error(
      error.response?.data?.message || "No se pudo enviar la respuesta."
    );
  }
}

// ──────────────────────────────
// PUT /post/:postId
// ──────────────────────────────
export async function updatePost(
  postId: string,
  message: string
): Promise<Post> {
  try {
    const { data } = await api.put<ApiResponse<Post>>(
      `/post/${encodeURIComponent(postId)}`,
      { message }
    );

    if (!data.success) {
      throw new Error(data.message || "Error al editar el post.");
    }

    return data.data;
  } catch (error: any) {
    console.error("[updatePost] Error:", error);
    throw new Error(
      error.response?.data?.message || "No se pudo editar el post."
    );
  }
}

// ──────────────────────────────
// DELETE /post/:postId
// ──────────────────────────────
export async function deletePost(postId: string): Promise<void> {
  try {
    const { data } = await api.delete<ApiResponse<unknown>>(
      `/post/${encodeURIComponent(postId)}`
    );

    if (!data.success) {
      throw new Error(data.message || "Error al eliminar el post.");
    }
  } catch (error: any) {
    console.error("[deletePost] Error:", error);
    throw new Error(
      error.response?.data?.message || "No se pudo eliminar el post."
    );
  }
}

// ──────────────────────────────
// PUT /post/:postId/response/:responseId
// ──────────────────────────────
export async function updateResponse(
  postId: string,
  responseId: string,
  message: string
): Promise<Post> {
  try {
    const { data } = await api.put<ApiResponse<Post>>(
      `/post/${encodeURIComponent(postId)}/response/${encodeURIComponent(responseId)}`,
      { message }
    );
    if (!data.success) {
      throw new Error(data.message || "Error al editar la respuesta.");
    }
    return data.data;
  } catch (error: any) {
    console.error("[updateResponse] Error:", error);
    throw new Error(error.response?.data?.message || "No se pudo editar la respuesta.");
  }
}

// ──────────────────────────────
// DELETE /post/:postId/response/:responseId
// ──────────────────────────────
export async function deleteResponse(postId: string, responseId: string): Promise<void> {
  try {
    const { data } = await api.delete<ApiResponse<unknown>>(
      `/post/${encodeURIComponent(postId)}/response/${encodeURIComponent(responseId)}`
    );
    if (!data.success) {
      throw new Error(data.message || "Error al eliminar la respuesta.");
    }
  } catch (error: any) {
    console.error("[deleteResponse] Error:", error);
    throw new Error(error.response?.data?.message || "No se pudo eliminar la respuesta.");
  }
}

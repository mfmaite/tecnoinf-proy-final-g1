import { api } from "./api";

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

interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

interface ForumPostsResponse {
  forum: {
    id: string;
    type: string;
    courseId: string;
  };
  posts: ForumPost[];
}

export async function getForumPosts(forumId: string): Promise<ForumPost[]> {
  try {
    const { data } = await api.get<ApiResponse<ForumPostsResponse>>(
      `/forum/${encodeURIComponent(forumId)}`
    );

    if (!data.success) {
      throw new Error(data.message || "Error al obtener posts del foro.");
    }

    const posts = data.data.posts;

    if (!Array.isArray(posts)) {
      throw new Error("Formato inesperado: 'posts' no es un array.");
    }

    return posts;
  } catch (error: any) {
    console.error("[getForumPosts] Error:", error);
    throw new Error(
      error.response?.data?.message ||
        "No se pudieron obtener los posts del foro."
    );
  }
}

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

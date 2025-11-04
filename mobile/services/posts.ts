import { api } from "./api";

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

export interface PostDetailResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    forum: ForumMinimal;
    post: Post;
    responses: Post[];
  };
}

/**
 * Helper para construir URL base limpia.
 */
function buildUrl(path: string) {
  const base =
    typeof (api as any).getUri === "function"
      ? (api as any).getUri()
      : (api as any).getUri ?? (api as any).defaults?.baseURL ?? "";
  return `${base.replace(/\/+$/, "")}${path}`;
}

/**
 * Helper para construir headers con o sin token.
 */
function buildHeaders(token?: string | null) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Obtiene un post con sus respuestas.
 */
export async function getPostById(
  postId: string,
  token?: string | null
): Promise<PostDetailResponse["data"]> {
  const url = buildUrl(`/post/${encodeURIComponent(postId)}`);

  const res = await fetch(url, {
    method: "GET",
    headers: buildHeaders(token),
  });

  const text = await res.text();

  if (!res.ok) {
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Error al obtener post (${res.status})`);
    } catch {
      throw new Error(`Error al obtener post (${res.status})`);
    }
  }

  try {
    const parsed: PostDetailResponse = JSON.parse(text);
    return parsed.data;
  } catch (err) {
    console.error("[getPostById] Error al parsear JSON:", err);
    throw new Error("Error al procesar la respuesta del servidor.");
  }
}

/**
 * Crea una respuesta dentro de un post.
 */
export async function createResponse(
  postId: string,
  message: string,
  token?: string | null
): Promise<Post> {
  const url = buildUrl(`/post/${encodeURIComponent(postId)}/response`);

  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ message }),
  });

  const text = await res.text();

  if (!res.ok) {
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || "Error al responder.");
    } catch {
      throw new Error("Error al responder.");
    }
  }

  try {
    const parsed = JSON.parse(text);
    return parsed.data;
  } catch (err) {
    console.error("[createResponse] Error al parsear respuesta:", err);
    throw new Error("Error al procesar la respuesta del servidor.");
  }
}

/**
 * Edita un post existente (solo autor o profesor).
 */
export async function updatePost(
  postId: string,
  message: string,
  token?: string | null
): Promise<Post> {
  const url = buildUrl(`/post/${encodeURIComponent(postId)}`);

  const res = await fetch(url, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify({ message }),
  });

  const text = await res.text();

  if (!res.ok) {
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || "Error al editar el post.");
    } catch {
      throw new Error(`Error al editar el post (${res.status})`);
    }
  }

  try {
    const parsed = JSON.parse(text);
    return parsed.data;
  } catch (err) {
    console.error("[updatePost] Error al parsear respuesta:", err);
    throw new Error("Error al procesar la respuesta del servidor.");
  }
}

/**
 * Elimina un post (solo autor o profesor).
 */
export async function deletePost(postId: string, token?: string | null): Promise<void> {
  const url = buildUrl(`/post/${encodeURIComponent(postId)}`);

  const res = await fetch(url, {
    method: "DELETE",
    headers: buildHeaders(token),
  });

  const text = await res.text();

  if (!res.ok) {
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Error al eliminar el post (${res.status})`);
    } catch {
      throw new Error(`Error al eliminar el post (${res.status})`);
    }
  }
}

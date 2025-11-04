import { api } from "./api";

export interface ForumPost {
  id: number;
  authorCi: string;
  authorName: string;
  authorPictureUrl?: string | null;
  message: string;
  createdDate: string;
}

export interface ForumResponse {
  success: boolean;
  status: number;
  message: string;
  data: ForumPost[];
}

export interface PostResponse {
  success: boolean;
  status: number;
  message: string;
  data: ForumPost;
}

export interface NewPostPayload {
  message: string;
}

/**
 * Helper para construir URL base completa.
 */
function buildUrl(path: string) {
  const base =
    typeof (api as any).getUri === "function"
      ? (api as any).getUri()
      : (api as any).getUri ?? (api as any).defaults?.baseURL ?? "";
  return `${base.replace(/\/+$/, "")}${path}`;
}

/**
 * Obtiene todos los posts de un foro dado su ID.
 */
export async function getForumPosts(
  forumId: string,
  token?: string | null
): Promise<ForumPost[]> {
  const url = buildUrl(`/forum/${encodeURIComponent(forumId)}`);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const text = await res.text();

    if (!res.ok) {
      // 🔍 Log extendido en caso de error
      console.warn(
        `[getForumPosts] Request failed (${res.status}) ${res.statusText}`,
        "\nURL:", url,
        "\nHeaders:", {
          Authorization: token ? "Bearer <token oculto>" : "Sin token",
        },
        "\nResponse:", text
      );

      if (res.status === 401)
        throw new Error("No autorizado. Por favor iniciá sesión nuevamente.");
      if (res.status === 404) throw new Error("Foro no encontrado.");
      throw new Error(`Error al obtener posts (${res.status})`);
    }

    // Parseo del JSON
    const parsed = JSON.parse(text);
    // Algunos endpoints devuelven posts dentro de data.posts, otros en data
    const posts = parsed.data?.posts || parsed.data || [];
    return posts;
  } catch (err: any) {
    // Si falla incluso la conexión
    if (err.message === "Network request failed") {
      console.error("[getForumPosts] No se pudo conectar al servidor:", url);
      throw new Error("No se pudo conectar al servidor. Revisá tu conexión o el backend.");
    }

    console.error("[getForumPosts] Error inesperado:", err);
    throw new Error(err.message || "Error al obtener los posts del foro.");
  }
}



/**
 * Crea un nuevo post en un foro (solo si el usuario está autenticado).
 */
export async function createForumPost(
  forumId: string,
  payload: NewPostPayload,
  token?: string | null
): Promise<ForumPost> {
  const url = buildUrl(`/forum/${encodeURIComponent(forumId)}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || "Error al publicar mensaje.");
    } catch {
      throw new Error("Error al publicar mensaje.");
    }
  }

  const json: PostResponse = JSON.parse(text);
  return json.data;
}

/**
 * Edita un post existente (solo el autor o un profesor puede hacerlo).
 */
export async function updateForumPost(
  postId: number,
  payload: NewPostPayload,
  token?: string | null
): Promise<ForumPost> {
  const url = buildUrl(`/post/${encodeURIComponent(postId)}`);

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || "Error al editar post.");
    } catch {
      throw new Error(`Error al editar post (${res.status})`);
    }
  }

  const json: PostResponse = JSON.parse(text);
  return json.data;
}

/**
 * Elimina un post existente (solo autor o profesor).
 */
export async function deleteForumPost(postId: number, token?: string | null): Promise<void> {
  const url = buildUrl(`/post/${encodeURIComponent(postId)}`);

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || `Error al eliminar post (${res.status})`);
    } catch {
      throw new Error(`Error al eliminar post (${res.status})`);
    }
  }
}

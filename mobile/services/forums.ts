import { api } from "./api";

export interface ForumPost {
  id: number;
  authorCi: string;
  authorName: string;
  message: string;
  createdDate: string;
}

export interface ForumResponse {
  success: boolean;
  status: number;
  message: string;
  data: ForumPost[];
}

export interface CreatePostPayload {
  message: string;
}

export interface CreatePostResponse {
  success: boolean;
  status: number;
  message: string;
  data: ForumPost;
}

// ---------- GET: obtener posts de un foro ----------

export async function getForumPosts(forumId: string): Promise<ForumPost[]> {
  const base =
    typeof (api as any).getUri === "function"
      ? (api as any).getUri()
      : (api as any).getUri ?? (api as any).defaults?.baseURL ?? "";

  const url = `${base.replace(/\/+$/, "")}/forum/${encodeURIComponent(forumId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();

  if (!res.ok) {
    if (res.status === 404) throw new Error("Foro no encontrado.");
    throw new Error(`Error al obtener posts (${res.status})`);
  }

  try {
    const parsed: ForumResponse = JSON.parse(text);
    return parsed.data || [];
  } catch (err) {
    console.error("[getForumPosts] Error al parsear JSON:", err);
    throw new Error("Error al procesar la respuesta del servidor.");
  }
}

// ---------- POST: crear un nuevo post en un foro ----------

export async function createForumPost(
  forumId: string,
  payload: CreatePostPayload,
  token?: string | null
): Promise<ForumPost> {
  const base =
    typeof (api as any).getUri === "function"
      ? (api as any).getUri()
      : (api as any).getUri ?? (api as any).defaults?.baseURL ?? "";

  const url = `${base.replace(/\/+$/, "")}/forum/${encodeURIComponent(forumId)}`;

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
    let msg = "Error al publicar mensaje.";
    try {
      const parsed = JSON.parse(text);
      msg = parsed.message || msg;
    } catch {}
    throw new Error(msg);
  }

  try {
    const parsed: CreatePostResponse = JSON.parse(text);
    return parsed.data;
  } catch (err) {
    console.error("[createForumPost] Error al parsear respuesta:", err);
    throw new Error("Error al procesar la respuesta del servidor.");
  }
}

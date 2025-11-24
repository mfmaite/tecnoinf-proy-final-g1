import { useRouter } from "expo-router";
import { api } from "../services/api";

/**
 * Estructura de lo que el hook parsea.
 */
type ParsedLink =
  | { type: "COURSE"; courseId: string }
  | { type: "FORUM"; courseId: string; forumId: string }
  | { type: "POST"; courseId: string; forumId: string; postId: string }
  | { type: "CHAT"; chatId: string }
  | null;

/**
 * Parsea el link que viene del backend/web.
 * Ejemplos soportados:
 *  - /courses/AAH2025
 *  - /courses/AAH2025/forums/4
 *  - /courses/AAH2025/forums/4/posts/33
 *  - /chats/18
 */
function parseBackendLink(link: string): ParsedLink {
  const parts = link.split("/").filter(Boolean);

  if (parts[0] === "courses") {
    const courseId = parts[1];

    if (parts.length === 2) {
      return { type: "COURSE", courseId };
    }

    if (parts[2] === "forums") {
      const forumId = parts[3];

      if (parts.length === 4) {
        return { type: "FORUM", courseId, forumId };
      }

      if (parts[4] === "posts") {
        const postId = parts[5];
        return { type: "POST", courseId, forumId, postId };
      }
    }
  }

  if (parts[0] === "chats") {
    return { type: "CHAT", chatId: parts[1] };
  }

  return null;
}

/**
 * Hook que expone navigateByActivityLink(link), para usar en cualquier pantalla
 * donde quieras navegar a partir de un 'link' del backend.
 */
export function useActivityNavigation() {
  const router = useRouter();

  /**
   * Resuelve partnerCi para un chat usando el endpoint /chats/{chatId}
   */
  async function resolveChatPartner(chatId: string): Promise<string | null> {
    try {
      const response = await api.get(`/chats/${chatId}`);
      return response.data?.data?.partnerCi ?? null;
    } catch (err) {
      console.error("Error obteniendo partnerCi del chat:", err);
      return null;
    }
  }

  /**
   * API principal del hook: recibe un link crudo del backend,
   * lo parsea y navega al lugar correcto.
   */
  async function navigateByActivityLink(rawLink: string) {
  const parsed = parseBackendLink(rawLink);

  if (!parsed) {
    console.warn("⚠ Link no reconocido:", rawLink);
    return;
  }

  switch (parsed.type) {
    case "COURSE":
      router.push({
        pathname: "/(courses)/[courseId]",
        params: { courseId: parsed.courseId }
      });
      break;

    case "FORUM":
      router.push({
        pathname: "/(courses)/[courseId]/forums/[forumId]",
        params: {
          courseId: parsed.courseId,
          forumId: parsed.forumId,
        },
      });
      break;

    case "POST":
      router.push({
        pathname:
          "/(courses)/[courseId]/forums/[forumId]/[postId]",
        params: {
          courseId: parsed.courseId,
          forumId: parsed.forumId,
          postId: parsed.postId,
        },
      });
      break;

    case "CHAT": {
      const partnerCi = await resolveChatPartner(parsed.chatId);

      if (!partnerCi) {
        console.warn("⚠ No se pudo resolver partnerCi del chat.");
        return;
      }

      router.push({
        pathname: "/(main)/chats/[partnerCi]",
        params: {
          partnerCi,
          chatId: parsed.chatId,
        },
      });
      break;
    }
  }
}

  return { navigateByActivityLink };
}

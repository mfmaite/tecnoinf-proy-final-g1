import { useRouter } from "expo-router";
import { api } from "../services/api";

/**
 * Tipos posibles de links que vienen del backend.
 */
type ParsedLink =
  | { type: "COURSE"; courseId: string }
  | { type: "FORUM"; courseId: string; forumId: string }
  | { type: "POST"; courseId: string; forumId: string; postId: string }
  | { type: "CONTENT"; courseId: string; contentId: string }
  | { type: "QUIZ"; courseId: string; quizId: string }
  | { type: "EVALUATION"; courseId: string; evaluationId: string }
  | { type: "CHAT"; chatId: string }
  | null;

/**
 * Parsea el link que viene del backend/web.
 * Ejemplos soportados ahora:
 *  - /courses/AAH2025
 *  - /courses/AAH2025/forums/4
 *  - /courses/AAH2025/forums/4/posts/33
 *  - /courses/AAH2025/contents/12
 *  - /courses/AAH2025/quizzes/8
 *  - /courses/AAH2025/evaluations/5
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

      if (parts.length === 4) return { type: "FORUM", courseId, forumId };
      if (parts[4] === "posts") {
        const postId = parts[5];
        return { type: "POST", courseId, forumId, postId };
      }
    }

    if (parts[2] === "contents") {
      const contentId = parts[3];
      return { type: "CONTENT", courseId, contentId };
    }

    if (parts[2] === "quizzes") {
      const quizId = parts[3];
      return { type: "QUIZ", courseId, quizId };
    }

    if (parts[2] === "evaluations") {
      const evaluationId = parts[3];
      return { type: "EVALUATION", courseId, evaluationId };
    }
  }

  if (parts[0] === "chats") {
    return { type: "CHAT", chatId: parts[1] };
  }

  return null;
}

export function useActivityNavigation() {
  const router = useRouter();

  /** Obtiene partnerCi desde backend, necesario para chats */
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
   * Navega a partir del link crudo enviado por backend
   */
  async function navigateByActivityLink(rawLink: string) {
    const parsed = parseBackendLink(rawLink);

    if (!parsed) {
      console.warn("⚠ Link no reconocido:", rawLink);
      return;
    }

    switch (parsed.type) {
      case "COURSE":
        router.push(`/(courses)/${parsed.courseId}`);
        break;

      case "FORUM":
        router.push(`/(courses)/${parsed.courseId}/forums/${parsed.forumId}`);
        break;

      case "POST":
        router.push(
          `/(courses)/${parsed.courseId}/forums/${parsed.forumId}/${parsed.postId}`
        );
        break;

      case "CONTENT":
        router.push(
          `/(courses)/${parsed.courseId}/contents/${parsed.contentId}`
        );
        break;

      case "QUIZ":
        router.push(`/(courses)/${parsed.courseId}/quizzes/${parsed.quizId}`);
        break;

      case "EVALUATION":
        router.push(
          `/(courses)/${parsed.courseId}/evaluations/${parsed.evaluationId}`
        );
        break;

      case "CHAT": {
        const partnerCi = await resolveChatPartner(parsed.chatId);
        if (!partnerCi) {
          console.warn("⚠ No se pudo resolver partnerCi del chat.");
          return;
        }

        router.push(`/(main)/chats/${partnerCi}`);
        break;
      }
    }
  }

  return { navigateByActivityLink };
}

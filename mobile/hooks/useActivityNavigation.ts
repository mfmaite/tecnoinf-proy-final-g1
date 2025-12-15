import { useRouter } from "expo-router";
import { api } from "../services/api";

function normalizeLink(rawLink: string): string {
  if (!rawLink) return rawLink;

  let link = rawLink.trim();


  if (link.startsWith("http://") || link.startsWith("https://")) {
    try {
      const url = new URL(link);
      return url.pathname + url.search + url.hash;
    } catch {
    }
  }

  if (link.startsWith("mentora://")) {
    const withoutScheme = link.replace("mentora://", "");
    return withoutScheme.startsWith("/") ? withoutScheme : "/" + withoutScheme;
  }

  if (!link.startsWith("/")) {
    return "/" + link;
  }

  return link;
}

type ParsedLink =
  | { type: "COURSE"; courseId: string }
  | { type: "FORUM"; courseId: string; forumId: string }
  | { type: "POST"; courseId: string; forumId: string; postId: string }
  | { type: "CONTENT"; courseId: string; contentId: string }
  | { type: "QUIZ"; courseId: string; quizId: string }
  | { type: "EVALUATION"; courseId: string; evaluationId: string }
  | { type: "CHAT"; chatId: string }
  | null;

function parseBackendLink(link: string): ParsedLink {
  const parts = link.split("/").filter(Boolean);

  if (parts[0] === "courses") {
    const courseId = parts[1];

    if (parts.length === 2) return { type: "COURSE", courseId };

    if (parts[2] === "forums") {
      const forumId = parts[3];

      if (parts.length === 4) return { type: "FORUM", courseId, forumId };
      if (parts[4] === "posts")
        return { type: "POST", courseId, forumId, postId: parts[5] };
    }

    if (parts[2] === "contents")
      return { type: "CONTENT", courseId, contentId: parts[3] };

    if (parts[2] === "quizzes")
      return { type: "QUIZ", courseId, quizId: parts[3] };

    if (parts[2] === "evaluations")
      return { type: "EVALUATION", courseId, evaluationId: parts[3] };
  }

  if (parts[0] === "chats") {
    return { type: "CHAT", chatId: parts[1] };
  }

  return null;
}

export function useActivityNavigation() {
  const router = useRouter();

  async function resolveChatPartner(chatId: string): Promise<string | null> {
    try {
      const response = await api.get(`/chats/${chatId}`);
      return response.data?.data?.partnerCi ?? null;
    } catch (err) {
      console.error("Error obteniendo partnerCi del chat:", err);
      return null;
    }
  }

  async function navigateByActivityLink(rawLink: string) {
    const cleanPath = normalizeLink(rawLink);
    const parsed = parseBackendLink(cleanPath);

    if (!parsed) {
      console.warn("Link no reconocido:", rawLink, "→", cleanPath);
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
          console.warn("No se pudo resolver partnerCi del chat.");
          return;
        }
        router.push(`/(main)/chats/${partnerCi}`);
        break;
      }
    }
  }

  return { navigateByActivityLink };
}

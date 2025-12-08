export function transformWebLinkToMobile(link: string): string {
  if (!link) return "/(main)/home";

  const postRegex = /^\/courses\/([^/]+)\/forums\/([^/]+)\/posts\/([^/]+)$/;
  const postMatch = link.match(postRegex);
  if (postMatch) {
    const [courseId, forumId, postId] = postMatch;
    return `/(courses)/${courseId}/forums/${forumId}/${postId}`;
  }

  const courseRegex = /^\/courses\/([^/]+)$/;
  const courseMatch = link.match(courseRegex);
  if (courseMatch) {
    const [courseId] = courseMatch;
    return `/(courses)/${courseId}`;
  }

  const chatRegex = /^\/chats\/([^/]+)$/;
  const chatMatch = link.match(chatRegex);
  if (chatMatch) {
    const [chatId] = chatMatch;
    return `/(main)/chats/${chatId}`;
  }

  console.warn("Link web no reconocido:", link);
  return "/(main)/home";
}

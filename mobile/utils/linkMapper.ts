// app/utils/linkMapper.ts

export function transformWebLinkToMobile(link: string): string {
  if (!link) return "/(main)/home";


  // /courses/{c}/forums/{f}/posts/{p}
  const postRegex = /^\/courses\/([^/]+)\/forums\/([^/]+)\/posts\/([^/]+)$/;
  const postMatch = link.match(postRegex);
  if (postMatch) {
    const [_, courseId, forumId, postId] = postMatch;
    return `/(courses)/${courseId}/forums/${forumId}/${postId}`;
  }


  // /courses/{c}
  const courseRegex = /^\/courses\/([^/]+)$/;
  const courseMatch = link.match(courseRegex);
  if (courseMatch) {
    const [_, courseId] = courseMatch;
    return `/(courses)/${courseId}`;
  }


  // /chats/{chatId}
  const chatRegex = /^\/chats\/([^/]+)$/;
  const chatMatch = link.match(chatRegex);
  if (chatMatch) {
    const [_, chatId] = chatMatch;
    return `/(main)/chats/${chatId}`;
  }

  // 4️⃣ Fallback
  console.warn("Link web no reconocido:", link);
  return "/(main)/home";
}

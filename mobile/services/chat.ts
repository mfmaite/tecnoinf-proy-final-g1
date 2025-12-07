import { api } from "./api";

export async function getChats() {
  const res = await api.get("/chats");
  return res.data.data;
}

export async function sendMessage(recipientCi: string, message: string) {
  const res = await api.post("/chats/send", { recipientCi, message });
  return res.data.data;
}

export async function getChatMessages(chatId: number) {
  const res = await api.get(`/chats/${chatId}/messages`);
  return res.data.data;
}

export async function getOrCreateChatWith(partnerCi: string) {
  const res = await api.get(`/chats/with/${partnerCi}`);
  const messages = res.data.data ?? [];

  if (!Array.isArray(messages)) {
    throw new Error("Formato inesperado de respuesta del backend");
  }
  const chatId = messages.length > 0 ? messages[0].chatId : null;
  return { id: chatId, messages };
}

import { api } from "./api";

export async function getChats() {
  const res = await api.get("/chats");
  return res.data.data ?? [];
}

export async function getChatMessages(chatId: number) {
  const res = await api.get(`/chats/${chatId}/messages`);
  return res.data.data ?? [];
}

export async function sendMessage(
  recipientCi: string,
  message: string
) {
  const res = await api.post("/chats/send", {
    recipientCi,
    message,
  });

  return res.data.data;
}

export async function getMessagesWith(partnerCi: string) {
  const res = await api.get(`/chats/with/${partnerCi}`);
  return res.data.data ?? [];
}

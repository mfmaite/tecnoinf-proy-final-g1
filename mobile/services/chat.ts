import { api } from "./api";

export async function getChats() {
  console.log("📡 Enviando request a chats:", api.defaults.baseURL);
  const res = await api.get("/chats");
  console.log("➡️ GET /chats");

  return res.data.data;
}

export async function sendMessage(recipientCi: string, message: string) {
  console.log("📡 Enviando request a send:", api.defaults.baseURL);
  const res = await api.post("/chats/send", { recipientCi, message });
  console.log("➡️ POST /sent");
  return res.data.data;
}

export async function getChatMessages(chatId: number) {
  console.log("📡 Enviando request a messages:", api.defaults.baseURL);
  const res = await api.get(`/chats/${chatId}/messages`);
  console.log("➡️ GET /messages");
  return res.data.data;
}

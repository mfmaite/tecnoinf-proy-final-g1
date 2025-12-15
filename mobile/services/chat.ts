import { api } from "./api";

/**
 * Devuelve TODOS los chats existentes del usuario
 * Fuente de verdad para saber si un chat existe
 */
export async function getChats() {
  const res = await api.get("/chats");
  return res.data.data ?? [];
}

/**
 * Devuelve los mensajes de un chat existente
 */
export async function getChatMessages(chatId: number) {
  const res = await api.get(`/chats/${chatId}/messages`);
  return res.data.data ?? [];
}

/**
 * Envía un mensaje
 * - Crea el chat si no existe
 * - Devuelve chatId en data.chatId
 */
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

/**
 * ⚠️ SOLO para listar mensajes con alguien
 * ❌ NO usar para iniciar chats
 */
export async function getMessagesWith(partnerCi: string) {
  const res = await api.get(`/chats/with/${partnerCi}`);
  return res.data.data ?? [];
}

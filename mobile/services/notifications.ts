// services/notifications.ts
import { api } from "./api";

export async function getNotifications() {
  try {
    const res = await api.get("/notifications");
    return res.data.data;
  } catch (e) {
    console.log("Error en getNotifications:", e);
    throw e;
  }
}

export async function markNotificationAsRead(id: string) {
  const res = await api.post(`/notifications/${id}/read`);
  return res.data;
}

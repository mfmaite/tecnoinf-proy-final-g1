import { api } from "./api";

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  const response = await api.post("/users/change-password", {
    oldPassword,
    newPassword,
    confirmPassword,
  });
  return response.data;
};

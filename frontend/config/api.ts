export const API_BASE_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  USERS: `${API_BASE_URL}/users`,
  COURSES: `${API_BASE_URL}/courses`,
  EVALUATIONS: `${API_BASE_URL}/evaluations`,
  PASSWORD_RECOVERY: `${API_BASE_URL}/users/password-recovery`,
  RESET_PASSWORD: `${API_BASE_URL}/users/reset-password`,
  FORUM: `${API_BASE_URL}/forum`,
  CHATS: `${API_BASE_URL}/chats`,
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  POSTS: `${API_BASE_URL}/post`,
} as const;

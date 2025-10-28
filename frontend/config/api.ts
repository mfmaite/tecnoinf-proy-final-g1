export const API_BASE_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  USERS: `${API_BASE_URL}/users`,
  COURSES: `${API_BASE_URL}/courses`,
  PASSWORD_RECOVERY: `${API_BASE_URL}/users/password-recovery`,
} as const;

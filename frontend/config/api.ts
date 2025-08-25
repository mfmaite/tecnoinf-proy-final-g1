export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  USERS: {
    SIGNUP: `${API_BASE_URL}/users/signup`,
    LOGIN: `${API_BASE_URL}/users/login`,
    PROFILE: `${API_BASE_URL}/users/profile`,
  },
} as const;

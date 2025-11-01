export interface UserSignUpData {
  ci: string;
  name: string;
  email: string;
  password: string;
  description?: string;
  pictureUrl?: string;
  role: 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE';
}

export interface UserLoginData {
  ci: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  code: number;
  message: string;
  data: string; // JWT token
}

export interface UserResponse {
  ci: string;
  name: string;
  email: string;
  description?: string;
  pictureUrl?: string;
  role: 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE';
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

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
  data: {
    jwt: string;
    user: UserResponse;
  };
}

export interface UserResponse {
  ci: string;
  name: string;
  email: string;
  description?: string;
  pictureUrl?: string;
  role: 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE';
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export interface ApiError {
  message: string;
  status?: number;
}

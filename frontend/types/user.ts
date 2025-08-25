export interface UserSignUpData {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  name: string;
  email: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

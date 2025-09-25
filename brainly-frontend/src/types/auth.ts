export interface LoginRequest {
  identifier: string; // email or username
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface AuthError {
  msg: string;
  error?: any;
}

export interface SignupError {
  errors?: Array<{
    code: string;
    message: string;
    path: string[];
  }>;
  msg?: string;
}
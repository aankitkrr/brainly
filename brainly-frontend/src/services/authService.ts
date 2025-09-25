import {apiClient} from "../lib/axios";
import { LoginRequest, SignupRequest, AuthResponse } from '../types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/api/v1/auth/signup', userData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('auth_token');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
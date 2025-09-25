export interface ApiError {
  msg: string;
  error?: any;
}

export interface ApiResponse<T = any> {
  data?: T;
  msg?: string;
  error?: string;
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
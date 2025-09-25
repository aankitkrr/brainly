import { AxiosError } from 'axios';

export interface ErrorResponse {
  msg: string;
  errors?: Array<{
    code: string;
    message: string;
    path: string[];
  }>;
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as ErrorResponse;
    
    if (errorData?.errors && errorData.errors.length > 0) {
      // Handle validation errors
      return errorData.errors.map(err => err.message).join(', ');
    }
    
    if (errorData?.msg) {
      return errorData.msg;
    }
    
    // Handle HTTP status codes
    switch (error.response?.status) {
      case 400:
        return 'Invalid request data';
      case 401:
        return 'Authentication required';
      case 403:
        return 'Access forbidden';
      case 404:
        return 'Resource not found';
      case 409:
        return 'Resource already exists';
      case 500:
        return 'Server error occurred';
      default:
        return 'An unexpected error occurred';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};
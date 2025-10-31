import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest, SignupRequest } from '../types/auth';

interface UseAuthFormOptions {
  onSuccess?: () => void;
}

export const useAuthForm = (options?: UseAuthFormOptions) => {
  const { login, signup, error, isLoading, clearError } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async (credentials: LoginRequest) => {
    try {
      setFormError(null);
      clearError();
      await login(credentials);
      options?.onSuccess?.();
    } catch (error) {
      // Error is already handled in the auth context
      setFormError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleSignup = async (userData: SignupRequest) => {
    try {
      setFormError(null);
      clearError();
      await signup(userData);
      options?.onSuccess?.();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Signup failed');
    }
  };

  const clearFormError = () => {
    setFormError(null);
    clearError();
  };

  return {
    handleLogin,
    handleSignup,
    isLoading,
    error: error || formError,
    clearError: clearFormError,
  };
};
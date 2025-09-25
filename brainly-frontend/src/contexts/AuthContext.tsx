import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/user';
import { LoginRequest, SignupRequest } from '../types/auth';
import { handleApiError } from '../utils/errorHandler';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = authService.getToken();
      if (token) {
        // TODO: Decode token to get user info or make a /me endpoint
        // For now, we'll just set authenticated state
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.login(credentials);
      authService.setToken(response.token);
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const signup = async (userData: SignupRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.signup(userData);
      authService.setToken(response.token);
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
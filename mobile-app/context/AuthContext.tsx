import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';
import { paymentService, PremiumAccess } from '../services/payment';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  premiumData: PremiumAccess['data'];
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  retryAuth: () => Promise<void>;
  checkPremium: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumData, setPremiumData] = useState<PremiumAccess['data']>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          await checkPremiumStatus();
          return;
        }
      }

      // No token/user in storage → auto register/login student in background
      const autoAuth = await authService.autoRegisterOrLoginStudent();
      setUser(autoAuth.user);
      await checkPremiumStatus();
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const access = await paymentService.checkPremiumAccess();
      setIsPremium(access.hasAccess);
      setPremiumData(access.data);
    } catch {
      setIsPremium(false);
      setPremiumData(null);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      setUser(response.user);
      await checkPremiumStatus();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await authService.register({ username, password });
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isPremium,
    premiumData,
    login,
    register,
    retryAuth: checkAuthStatus,
    checkPremium: checkPremiumStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

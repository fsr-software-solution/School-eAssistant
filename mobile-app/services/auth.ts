import api from './api';
import { tokenStorage, userStorage } from '../utils/storage';
import { getOrCreateDeviceId } from '../utils/deviceId';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  role?: 'student' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

function buildDeviceCredentials(deviceId: string) {
  // Backend constraint: Users.username max length is 50.
  // So we derive a short, deterministic username from deviceId.
  const compact = deviceId.replace(/[^a-zA-Z0-9]/g, '');
  const username = `stu_${compact.slice(0, 40)}`; // <= 44 chars

  // Per your request: use the generated id as the password.
  const password = deviceId;

  return { username, password };
}

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const deviceId = await getOrCreateDeviceId();

    const response = await api.post<AuthResponse>('/auth/login', {
      ...credentials,
      deviceId, // Include device ID in login
    });

    if (response.data.success) {
      // Save tokens
      await tokenStorage.saveTokens(
        response.data.accessToken,
        response.data.refreshToken
      );

      // Save user data
      await userStorage.saveUser(response.data.user);
    }

    return response.data;
  },

  /**
   * Register new user (The backend handles registration via the login endpoint)
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const deviceId = await getOrCreateDeviceId();

    // Backend doesn't have /auth/register. /auth/login creates the user if it doesn't exist.
    const response = await api.post<AuthResponse>('/auth/login', {
      username: data.username,
      password: data.password,
      role: data.role || 'student',
      deviceId, // Include device ID
    });

    if (response.data.success) {
      // Save tokens
      await tokenStorage.saveTokens(
        response.data.accessToken,
        response.data.refreshToken
      );

      // Save user data
      await userStorage.saveUser(response.data.user);
    }

    return response.data;
  },

  /**
   * Student auto-authentication:
   * - generate deviceId in background
   * - use deviceId as password
   * - use derived username from deviceId (keeps <= 50 chars for backend)
   * - call login, which creates the user if they don't exist on the backend
   */
  async autoRegisterOrLoginStudent(): Promise<AuthResponse> {
    const deviceId = await getOrCreateDeviceId();
    const { username, password } = buildDeviceCredentials(deviceId);

    return await this.login({ username, password });
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) return null;

      const response = await api.post<{ accessToken: string }>('/auth/refresh-token', {
        refreshToken,
      });

      const newAccessToken = response.data.accessToken;
      await tokenStorage.saveTokens(newAccessToken, refreshToken);

      return newAccessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      await tokenStorage.clearTokens();
      return null;
    }
  },

  /**
   * Get current user from storage
   */
  async getCurrentUser() {
    return await userStorage.getUser();
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await tokenStorage.getAccessToken();
    return !!token;
  },
};


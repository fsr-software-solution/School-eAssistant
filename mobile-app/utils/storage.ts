import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Check if SecureStore is available (native platforms only)
 */
const isSecureStoreAvailable = Platform.OS !== 'web' && SecureStore.isAvailableAsync;


export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use AsyncStorage on web
        await AsyncStorage.setItem(key, value);
      } else {
        // Use SecureStore on native
        const available = await SecureStore.isAvailableAsync();
        if (available) {
          await SecureStore.setItemAsync(key, value);
        } else {
          // Fallback to AsyncStorage if SecureStore not available
          await AsyncStorage.setItem(key, value);
        }
      }
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Use AsyncStorage on web
        return await AsyncStorage.getItem(key);
      } else {
        // Use SecureStore on native
        const available = await SecureStore.isAvailableAsync();
        if (available) {
          return await SecureStore.getItemAsync(key);
        } else {
          // Fallback to AsyncStorage if SecureStore not available
          return await AsyncStorage.getItem(key);
        }
      }
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use AsyncStorage on web
        await AsyncStorage.removeItem(key);
      } else {
        // Use SecureStore on native
        const available = await SecureStore.isAvailableAsync();
        if (available) {
          await SecureStore.deleteItemAsync(key);
        } else {
          // Fallback to AsyncStorage if SecureStore not available
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
};

/**
 * Regular storage for non-sensitive data
 */
export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
};

/**
 * Token management
 */
export const tokenStorage = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  async getAccessToken(): Promise<string | null> {
    return await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return await secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

/**
 * User data management
 */
export const userStorage = {
  async saveUser(user: any): Promise<void> {
    await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  async getUser(): Promise<any | null> {
    const userStr = await storage.getItem(STORAGE_KEYS.USER_DATA);
    return userStr ? JSON.parse(userStr) : null;
  },

  async clearUser(): Promise<void> {
    await storage.removeItem(STORAGE_KEYS.USER_DATA);
  },
};


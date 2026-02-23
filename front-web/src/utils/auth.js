import { STORAGE_KEYS } from '../constants';

/**
 * Authentication utility functions
 */

// Get access token
export const getAccessToken = () => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

// Get refresh token
export const getRefreshToken = () => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

// Get user data
export const getUser = () => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAccessToken() && !!getRefreshToken();
};

// Logout user - clear all tokens and user data
export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Clear all authentication data
export const clearAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Set authentication tokens and user data
export const setAuthData = (accessToken, refreshToken, user) => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};
/**
 * App Configuration
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://brittny-reprehensible-joel.ngrok-free.dev/api/v1';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  DEVICE_ID: 'device_id',
  USER_DATA: 'user_data',
} as const;

export const lightColors = {
  primary: '#6366F1', // Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  secondary: '#8B5CF6', // Purple
  accent: '#EC4899', // Pink
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  disabled: '#D1D5DB',
};

export const darkColors = {
  primary: '#818CF8',
  primaryDark: '#6366F1',
  primaryLight: '#A5B4FC',
  secondary: '#A78BFA',
  accent: '#F472B6',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  background: '#111827', // Dark background
  surface: '#1F2937',    // Dark surface
  text: '#F9FAFB',       // Light text
  textSecondary: '#9CA3AF',
  border: '#374151',
  disabled: '#4B5563',
};

export const COLORS = lightColors; // Default fallback

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const getTypography = (scale: number = 1) => ({
  h1: { fontSize: Math.round(32 * scale), fontWeight: '700' as const, lineHeight: Math.round(40 * scale) },
  h2: { fontSize: Math.round(24 * scale), fontWeight: '700' as const, lineHeight: Math.round(32 * scale) },
  h3: { fontSize: Math.round(20 * scale), fontWeight: '600' as const, lineHeight: Math.round(28 * scale) },
  body: { fontSize: Math.round(16 * scale), fontWeight: '400' as const, lineHeight: Math.round(24 * scale) },
  bodySmall: { fontSize: Math.round(14 * scale), fontWeight: '400' as const, lineHeight: Math.round(20 * scale) },
  caption: { fontSize: Math.round(12 * scale), fontWeight: '400' as const, lineHeight: Math.round(16 * scale) },
});

export const TYPOGRAPHY = getTypography(1);

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;


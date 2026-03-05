import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { secureStorage } from './storage';

const DEVICE_ID_KEY = 'app_device_id';

/**
 * Generate a unique device ID using only Expo APIs (no native linking required)
 */
async function generateDeviceId(): Promise<string> {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  
  try {
    if (Platform.OS === 'web') {
      // Web platform - use browser fingerprint
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'web';
      const language = typeof navigator !== 'undefined' ? navigator.language : 'en';
      const platform = typeof navigator !== 'undefined' ? navigator.platform : 'unknown';
      const fingerprint = `${userAgent}-${language}-${platform}-${timestamp}`;
      const encoded = typeof btoa !== 'undefined' 
        ? btoa(fingerprint).substring(0, 20) 
        : Buffer.from(fingerprint).toString('base64').substring(0, 20);
      return `web-${encoded}-${timestamp}-${random}`;
    } else if (Platform.OS === 'android') {
      // Android - use Expo Application API
      try {
        const androidId = await Application.getAndroidId();
        if (androidId) {
          return `android-${androidId}-${timestamp}-${random}`;
        }
      } catch (e) {
        console.log('Android ID not available, using fallback');
      }
      
      // Fallback: use timestamp + random (unique per install)
      return `android-${timestamp}-${random}`;
    } else {
      // iOS - use Expo Application API
      try {
        const bundleId = Application.applicationId;
        
        if (bundleId) {
          return `ios-${bundleId}-${timestamp}-${random}`;
        } else {
          return `ios-${timestamp}-${random}`;
        }
      } catch (e) {
        console.log('iOS ID generation error, using fallback');
      }
      
      // Final fallback
      return `ios-${timestamp}-${random}`;
    }
  } catch (error) {
    // Ultimate fallback
    return `device-${Platform.OS}-${timestamp}-${random}`;
  }
}

/**
 * Get or create a unique device ID for this app installation
 * Stores in SecureStore for persistence
 */
export async function getOrCreateDeviceId(): Promise<string> {
  try {
    // Try to get existing device ID
    let deviceId = await secureStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate new device ID on first install
      deviceId = await generateDeviceId();
      await secureStorage.setItem(DEVICE_ID_KEY, deviceId);
      console.log('New device ID generated:', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Fallback to generated ID if storage fails
    return await generateDeviceId();
  }
}

/**
 * Get device ID without creating if it doesn't exist
 */
export async function getDeviceId(): Promise<string | null> {
  try {
    return await secureStorage.getItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error('Error getting device ID:', error);
    return null;
  }
}


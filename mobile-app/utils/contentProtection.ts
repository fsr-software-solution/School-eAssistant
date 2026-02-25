import { useEffect } from 'react';
import * as ScreenCapture from 'expo-screen-capture';
import { Alert, Platform } from 'react-native';

/**
 * Hook to enable content protection (screenshot and screen recording prevention)
 * Use this in screens that display protected content (books, quiz, chat)
 */
export function useContentProtection(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    let subscription: any = null;

    const enableProtection = async () => {
      try {
        // Prevent screenshots (works on Android, iOS can detect but not fully prevent)
        if (Platform.OS === 'android') {
          await ScreenCapture.preventScreenCaptureAsync();
        }

        // Detect screenshot attempts (iOS/Android)
        subscription = ScreenCapture.addScreenshotListener(() => {
          Alert.alert(
            'Security Alert',
            'Screenshots are not allowed for this content. Please respect copyright.',
            [{ text: 'OK' }]
          );
        });
      } catch (error) {
        console.warn('Content protection error:', error);
      }
    };

    enableProtection();

    return () => {
      // Cleanup: Allow screenshots again when component unmounts
      if (subscription) {
        subscription.remove();
      }
      if (Platform.OS === 'android') {
        ScreenCapture.allowScreenCaptureAsync().catch(console.warn);
      }
    };
  }, [enabled]);
}

/**
 * Disable text selection on Text components
 * Use selectable={false} prop on Text components in protected content
 */
export const textProtectionProps = {
  selectable: false,
  onLongPress: () => {
    // Prevent long-press context menu
  },
};


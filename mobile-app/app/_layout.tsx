import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { useEffect } from 'react';
import { getOrCreateDeviceId } from '../utils/deviceId';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  useEffect(() => {
    // Initialize device ID on app launch
    getOrCreateDeviceId().catch(console.error);
  }, []);

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F9FAFB' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <Toast />
    </AuthProvider>
  );
}

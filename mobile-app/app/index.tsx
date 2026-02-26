import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';

export default function Index() {
  const router = useRouter();
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Always go directly to the main app tabs.
      // AuthContext already auto-registers/logs in the student in the background
      // using the unique device ID as username & password.
      router.replace('/(tabs)');
    }
  }, [isLoading]);

  return <LoadingScreen />;
}

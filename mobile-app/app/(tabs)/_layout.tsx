import { Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../../constants/config';
import { Platform, View, StyleSheet } from 'react-native';
import Text from '../../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import LoadingScreen from '../../components/ui/LoadingScreen';

export default function TabsLayout() {
  const { isAuthenticated, isLoading, retryAuth } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="wifi-outline" size={64} color={colors.textSecondary} />
        <Text variant="h2" color={colors.text} style={styles.errorTitle}>Connection Error</Text>
        <Text variant="body" color={colors.textSecondary} style={styles.errorText}>
          We couldn't connect to the server to verify your account. Please check your internet connection and try again.
        </Text>
        <Button title="Retry Connection" onPress={retryAuth} style={styles.retryButton} />
      </View>
    );
  }

  // Calculate tab bar height and padding based on safe area insets
  const tabBarHeight = Platform.OS === 'ios'
    ? 49 + insets.bottom
    : 56 + insets.bottom;

  const tabBarPaddingBottom = Platform.OS === 'ios'
    ? insets.bottom
    : Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="books"
        options={{
          title: 'Books',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  retryButton: {
    minWidth: 200,
  },
});


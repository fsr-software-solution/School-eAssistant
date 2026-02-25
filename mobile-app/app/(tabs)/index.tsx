import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Text from '../../components/ui/Text';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/ui/Button';
import { SPACING } from '../../constants/config';
import { Ionicons } from '@expo/vector-icons';
import { Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Calculate bottom padding: tab bar height + safe area bottom
  const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
  const bottomPadding = tabBarHeight + insets.bottom + SPACING.md;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text variant="h2" style={styles.greeting}>Welcome back!</Text>
            <Text color={colors.textSecondary} style={styles.username}>Ready to learn?</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={[styles.settingsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={24} color={colors.primary} />
            <Text variant="h3" style={styles.cardTitle}>Your Books</Text>
          </View>
          <Text color={colors.textSecondary} style={styles.cardText}>
            Access your learning materials and study at your own pace.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color={colors.secondary} />
            <Text variant="h3" style={styles.cardTitle}>Take Quizzes</Text>
          </View>
          <Text color={colors.textSecondary} style={styles.cardText}>
            Test your knowledge with interactive quizzes.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbubbles" size={24} color={colors.accent} />
            <Text variant="h3" style={styles.cardTitle}>AI Assistant</Text>
          </View>
          <Text color={colors.textSecondary} style={styles.cardText}>
            Get help from your AI learning companion.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    marginBottom: SPACING.xs,
  },
  username: {
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  card: {
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    marginLeft: SPACING.sm,
  },
  cardText: {
    marginTop: SPACING.xs,
  },
});


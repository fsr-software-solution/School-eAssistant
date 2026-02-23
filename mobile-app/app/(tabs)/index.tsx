import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/config';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding: tab bar height + safe area bottom
  const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
  const bottomPadding = tabBarHeight + insets.bottom + SPACING.md;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]} 
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.username}>{user?.username}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="book" size={24} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Your Books</Text>
        </View>
        <Text style={styles.cardText}>
          Access your learning materials and study at your own pace.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text" size={24} color={COLORS.secondary} />
          <Text style={styles.cardTitle}>Take Quizzes</Text>
        </View>
        <Text style={styles.cardText}>
          Test your knowledge with interactive quizzes.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="chatbubbles" size={24} color={COLORS.accent} />
          <Text style={styles.cardTitle}>AI Assistant</Text>
        </View>
        <Text style={styles.cardText}>
          Get help from your AI learning companion.
        </Text>
      </View>

      <Button
        title="Logout"
        onPress={logout}
        variant="outline"
        style={styles.logoutButton}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  greeting: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  username: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
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
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  cardText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  logoutButton: {
    marginTop: SPACING.xl,
  },
});


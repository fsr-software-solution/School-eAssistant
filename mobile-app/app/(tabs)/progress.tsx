import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../../components/ui/Text';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../constants/config';
import { Platform } from 'react-native';

export default function ProgressScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Calculate bottom padding: tab bar height + safe area bottom
  const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
  const bottomPadding = tabBarHeight + insets.bottom + SPACING.md;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.content, { paddingBottom: bottomPadding }]}>
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <Text variant="bodySmall" color={colors.textSecondary} style={styles.label}>Progress Data</Text>
          <Text variant="body" style={styles.value}>Stats Coming Soon...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  profileCard: {
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  label: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  value: {
    fontWeight: '600',
  },
});


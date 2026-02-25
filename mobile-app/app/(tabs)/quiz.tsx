import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING } from '../../constants/config';
import { useTheme } from '../../context/ThemeContext';
import Text from '../../components/ui/Text';
import { Platform } from 'react-native';

export default function QuizScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Calculate bottom padding: tab bar height + safe area bottom
  const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
  const bottomPadding = tabBarHeight + insets.bottom + SPACING.md;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.content, { paddingBottom: bottomPadding }]}>
        <Text variant="body" color={colors.textSecondary}>Quiz Screen - Coming Soon</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});


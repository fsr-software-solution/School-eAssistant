import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/config';
import { Platform } from 'react-native';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding: tab bar height + safe area bottom
  const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
  const bottomPadding = tabBarHeight + insets.bottom + SPACING.md;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.content, { paddingBottom: bottomPadding }]}>
        <Text style={styles.text}>Chat Screen - Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});


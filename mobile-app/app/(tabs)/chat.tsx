import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SPACING, BORDER_RADIUS } from '../../constants/config';

export default function ChatTab() {
  const { colors } = useTheme();
  const { isPremium } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
  const bottomPadding = tabBarHeight + insets.bottom + SPACING.md;

  if (isPremium) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          <View style={[styles.headerIcon, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name="chatbubbles" size={40} color={colors.accent} />
          </View>
          <Text variant="h2" color={colors.text} style={styles.title}>AI Chat</Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Chat with your AI learning assistant about any topic.
          </Text>
          <Button
            title="Go to My Chats"
            onPress={() => router.push('/chat')}
            style={styles.btn}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Premium gate
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.content, { paddingBottom: bottomPadding }]}>
        <View style={[styles.lockIcon, { backgroundColor: colors.border }]}>
          <Ionicons name="lock-closed" size={40} color={colors.textSecondary} />
        </View>
        <Text variant="h2" color={colors.text} style={styles.title}>AI Chat</Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Ask your AI assistant anything about your studies. Upgrade to premium to unlock this feature.
        </Text>
        <View style={[styles.featureList, { backgroundColor: colors.surface }]}>
          {['Ask any study question', 'AI answers with confidence score', 'Full conversation history'].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text variant="bodySmall" color={colors.text} style={{ marginLeft: SPACING.sm, flex: 1 }}>{f}</Text>
            </View>
          ))}
        </View>
        <Button
          title="🔓 Get Premium Access"
          onPress={() => router.push('/premium')}
          style={styles.btn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  headerIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
  lockIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
  title: { marginBottom: SPACING.sm },
  subtitle: { textAlign: 'center', lineHeight: 24, marginBottom: SPACING.lg },
  featureList: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, width: '100%', marginBottom: SPACING.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  btn: { width: '100%' },
});

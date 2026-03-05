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

export default function QuizTab() {
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
          <View style={[styles.headerIcon, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="document-text" size={40} color={colors.secondary} />
          </View>
          <Text variant="h2" color={colors.text} style={styles.title}>Quizzes</Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Test your knowledge with AI-generated quizzes on any topic.
          </Text>
          <Button
            title="Go to My Quizzes"
            onPress={() => router.push('/quiz')}
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
        <Text variant="h2" color={colors.text} style={styles.title}>Quizzes</Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Access AI-generated quizzes to test your knowledge. Upgrade to premium to unlock this feature.
        </Text>
        <View style={[styles.featureList, { backgroundColor: colors.surface }]}>
          {['AI-generated questions on any topic', 'Multiple choice with explanations', 'Score & review after each quiz'].map((f, i) => (
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

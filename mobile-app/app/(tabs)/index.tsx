import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import Text from '../../components/ui/Text';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/ui/Button';
import { SPACING, BORDER_RADIUS } from '../../constants/config';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { progressService, StudentProgress } from '../../services/progress';
import { booksService } from '../../services/books';
import { useState, useEffect, useCallback } from 'react';


export default function HomeScreen() {
  const { user, isPremium, premiumData } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
  const bottomPadding = tabBarHeight + insets.bottom + SPACING.md;

  const [lastProgress, setLastProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLastProgress = useCallback(async () => {
    if (!user) return;
    try {
      const data = await progressService.getStudentProgress(user.id);
      if (data && data.length > 0) {
        // Sort by date
        const sorted = [...data].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        const last = sorted[0];

        // Enrich with section and unit details
        try {
          const section = await booksService.getSectionById(last.sectionId);
          const unit = await booksService.getUnitById(section.unitId);

          setLastProgress({
            ...last,
            sectionId: {
              ...section,
              unitId: unit
            }
          } as any);
        } catch (detailErr) {
          console.error('Failed to enrich last progress details', detailErr);
          setLastProgress(last);
        }
      }
    } catch (error) {

      console.error('Failed to load last progress', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLastProgress();
  }, [loadLastProgress]);

  const expiryLabel = premiumData?.expiresAt
    ? `Expires ${new Date(premiumData.expiresAt).toLocaleDateString()}`
    : null;


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="h2" style={styles.greeting}>Welcome back!</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={[styles.settingsBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Premium Status Card */}
        {isPremium ? (
          <View style={[styles.premiumCard, { backgroundColor: '#F59E0B15', borderColor: '#F59E0B40' }]}>
            <View style={styles.premiumCardLeft}>
              <View style={[styles.premiumBadge, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="diamond" size={20} color="#F59E0B" />
                <Text variant="bodySmall" color="#F59E0B" style={{ marginLeft: 6, fontWeight: '700' }}>PREMIUM</Text>
              </View>
              <Text variant="body" color={colors.text} style={{ fontWeight: '600', marginTop: SPACING.xs }}>
                {premiumData?.planName ?? 'Premium Access'}
              </Text>
              {expiryLabel && (
                <Text variant="bodySmall" color={colors.textSecondary}>{expiryLabel}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => router.push('/premium/history')}>
              <Ionicons name="receipt-outline" size={22} color="#F59E0B" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.upgradeCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}
            onPress={() => router.push('/premium')}
            activeOpacity={0.8}
          >
            <Ionicons name="diamond-outline" size={24} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text variant="body" color={colors.primary} style={{ fontWeight: '700' }}>Upgrade to Premium</Text>
              <Text variant="bodySmall" color={colors.textSecondary}>Unlock quizzes, AI chat & more</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Continue Learning Card */}
        {lastProgress && (
          <TouchableOpacity
            style={[styles.continueCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              const section = lastProgress.sectionId as any;
              router.push({ pathname: '/books/section/[id]', params: { id: section._id } });
            }}
            activeOpacity={0.8}
          >
            <View style={styles.continueHeader}>
              <View style={[styles.continueIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="play" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text variant="bodySmall" color={colors.textSecondary} style={{ fontWeight: '700', letterSpacing: 0.5 }}>CONTINUE LEARNING</Text>
                <Text variant="body" color={colors.text} style={{ fontWeight: '700', marginTop: 2 }} numberOfLines={1}>
                  {(lastProgress.sectionId as any).title}
                </Text>
                <Text variant="bodySmall" color={colors.textSecondary}>
                  {(lastProgress.sectionId as any).unitId.title}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}


        {/* Quick Access Cards */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={24} color={colors.primary} />
            <Text variant="h3" style={styles.cardTitle}>Your Books</Text>
          </View>
          <Text color={colors.textSecondary} style={styles.cardText}>
            Access your learning materials and study at your own pace.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.surface, opacity: isPremium ? 1 : 0.7 }]}
          onPress={() => isPremium ? router.push('/quiz') : router.push('/premium')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color={colors.secondary} />
            <Text variant="h3" style={styles.cardTitle}>Take Quizzes</Text>
            {!isPremium && <Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />}
          </View>
          <Text color={colors.textSecondary} style={styles.cardText}>
            {isPremium ? 'Test your knowledge with AI-generated quizzes.' : 'Premium feature — Upgrade to access.'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.surface, opacity: isPremium ? 1 : 0.7 }]}
          onPress={() => isPremium ? router.push('/chat') : router.push('/premium')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="chatbubbles" size={24} color={colors.accent} />
            <Text variant="h3" style={styles.cardTitle}>AI Assistant</Text>
            {!isPremium && <Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />}
          </View>
          <Text color={colors.textSecondary} style={styles.cardText}>
            {isPremium ? 'Get help from your AI learning companion.' : 'Premium feature — Upgrade to access.'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg },
  header: {
    marginBottom: SPACING.xl, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  greeting: { marginBottom: SPACING.xs },
  settingsBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
    elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  premiumCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, marginBottom: SPACING.lg,
  },
  premiumCardLeft: { flex: 1 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
  upgradeCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, marginBottom: SPACING.lg,
  },
  card: {
    borderRadius: 12, padding: SPACING.lg, marginBottom: SPACING.md,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, shadowColor: '#000',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  cardTitle: { marginLeft: SPACING.sm },
  cardText: { marginTop: SPACING.xs },
  continueCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  continueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


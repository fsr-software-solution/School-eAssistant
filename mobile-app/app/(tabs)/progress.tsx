import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, BORDER_RADIUS } from '../../constants/config';
import Text from '../../components/ui/Text';
import { progressService, StudentProgress } from '../../services/progress';
import { booksService, Book } from '../../services/books';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

// Simple ProgressBar component
const ProgressBar = ({ progress, color }: { progress: number, color: string }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
      <View
        style={[
          styles.progressBarFill,
          {
            backgroundColor: color,
            width: `${Math.min(100, Math.max(0, progress))}%`
          }
        ]}
      />
    </View>
  );
};

interface BookProgressSummary {
  book: {
    _id: string;
    subject: string;
    gradeLevel: string;
  };
  completed: number;
  inProgress: number;
  totalStarted: number;
  lastUpdated: string;
  sections: StudentProgress[];
}

export default function ProgressScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progressData, setProgressData] = useState<StudentProgress[]>([]);
  const [summaryByBook, setSummaryByBook] = useState<BookProgressSummary[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalCompleted: 0,
    totalInProgress: 0,
    totalStarted: 0
  });

  const loadData = useCallback(async (isSilent = false) => {
    if (!user) return;

    try {
      if (!isSilent) setLoading(true);
      const data = await progressService.getStudentProgress(user.id);

      // Calculate overall stats
      const completed = data.filter(p => p.status === 'completed').length;
      const inProgress = data.filter(p => p.status === 'in progress').length;
      setOverallStats({
        totalCompleted: completed,
        totalInProgress: inProgress,
        totalStarted: data.length
      });

      // Caches to avoid redundant requests

      // Caches to avoid redundant requests
      const sectionCache = new Map<string, any>();
      const unitCache = new Map<string, any>();
      const bookCache = new Map<string, any>();

      // 1. Enrichment Phase (Parallel)
      const enrichedDataRaw = await Promise.all(data.map(async (p) => {
        try {
          // 1. Get Section
          let section = sectionCache.get(p.sectionId);
          if (!section) {
            section = await booksService.getSectionById(p.sectionId);
            sectionCache.set(p.sectionId, section);
          }

          // 2. Get Unit
          let unit = unitCache.get(section.unitId);
          if (!unit) {
            unit = await booksService.getUnitById(section.unitId);
            unitCache.set(section.unitId, unit);
          }

          // 3. Get Book
          let bookInfo = bookCache.get(unit.bookId);
          if (!bookInfo) {
            bookInfo = await booksService.getBookById(unit.bookId);
            bookCache.set(unit.bookId, bookInfo);
          }

          return { ...p, sectionId: { ...section, unitId: { ...unit, bookId: bookInfo } } };
        } catch (err) {
          console.error(`Error enriching progress ${p._id}`, err);
          return null;
        }
      }));

      const enrichedData = enrichedDataRaw.filter(item => item !== null) as any[];

      // 2. Statistics and Grouping Phase (Synchronous)
      const booksMap = new Map<string, BookProgressSummary>();
      let completedCount = 0;
      let inProgressCount = 0;

      enrichedData.forEach(p => {
        if (p.status === 'completed') completedCount++;
        if (p.status === 'in progress') inProgressCount++;

        const section = p.sectionId;
        const bookInfo = section.unitId.bookId;
        const bookId = bookInfo._id;

        if (!booksMap.has(bookId)) {
          booksMap.set(bookId, {
            book: bookInfo,
            completed: 0,
            inProgress: 0,
            totalStarted: 0,
            lastUpdated: p.updatedAt,
            sections: []
          });
        }

        const summary = booksMap.get(bookId)!;
        summary.totalStarted++;
        if (p.status === 'completed') summary.completed++;
        if (p.status === 'in progress') summary.inProgress++;
        summary.sections.push(p);

        if (new Date(p.updatedAt) > new Date(summary.lastUpdated)) {
          summary.lastUpdated = p.updatedAt;
        }
      });

      setOverallStats({
        totalCompleted: completedCount,
        totalInProgress: inProgressCount,
        totalStarted: enrichedData.length
      });

      setProgressData(enrichedData);
      setSummaryByBook(Array.from(booksMap.values()).sort((a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      ));

    } catch (error) {
      console.error('Failed to load progress data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);


  // Refresh data when tab is focused
  useFocusEffect(
    useCallback(() => {
      loadData(true);
    }, [loadData])
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in progress': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
  const bottomPadding = tabBarHeight + insets.bottom + SPACING.md;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text variant="h1" color={colors.text} style={styles.title}>Your Learning Progress</Text>

        {/* Overall Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-done-circle" size={24} color={colors.success} />
            </View>
            <Text variant="h2" color={colors.text}>{overallStats.totalCompleted}</Text>
            <Text variant="bodySmall" color={colors.textSecondary}>Completed</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="timer-outline" size={24} color={colors.primary} />
            </View>
            <Text variant="h2" color={colors.text}>{overallStats.totalInProgress}</Text>
            <Text variant="bodySmall" color={colors.textSecondary}>In Progress</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="book-outline" size={24} color={colors.secondary} />
            </View>
            <Text variant="h2" color={colors.text}>{overallStats.totalStarted}</Text>
            <Text variant="bodySmall" color={colors.textSecondary}>Total Units</Text>
          </View>
        </View>

        {/* Books Progress */}
        <Text variant="h2" color={colors.text} style={styles.sectionTitle}>Progress by Subject</Text>

        {summaryByBook.length > 0 ? (
          summaryByBook.map((summary) => (
            <TouchableOpacity
              key={summary.book._id}
              style={[styles.bookCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push({ pathname: '/books/[id]', params: { id: summary.book._id } })}
              activeOpacity={0.8}
            >

              <View style={styles.bookHeader}>
                <View>
                  <Text variant="h3" color={colors.text}>{summary.book.subject}</Text>
                  <Text variant="bodySmall" color={colors.textSecondary}>Grade {summary.book.gradeLevel}</Text>
                </View>
                <View style={[styles.progressBadge, { backgroundColor: colors.primary + '10' }]}>
                  <Text variant="bodySmall" color={colors.primary} style={styles.percentageText}>
                    {Math.round((summary.completed / summary.totalStarted) * 100)}%
                  </Text>
                </View>
              </View>

              <ProgressBar
                progress={(summary.completed / summary.totalStarted) * 100}
                color={colors.primary}
              />

              <View style={styles.bookFooter}>
                <Text variant="bodySmall" color={colors.textSecondary}>
                  {summary.completed} completed, {summary.inProgress} in progress
                </Text>
                <Text variant="bodySmall" color={colors.textSecondary}>
                  {summary.totalStarted} Total
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="school-outline" size={48} color={colors.textSecondary} />
            <Text variant="h3" color={colors.text} style={styles.emptyTitle}>No Progress Found</Text>
            <Text variant="body" color={colors.textSecondary} style={styles.emptyText}>
              Start reading any book to track your progress here.
            </Text>
          </View>
        )}

        {/* Recent Activity */}
        {progressData.length > 0 && (
          <>
            <Text variant="h2" color={colors.text} style={styles.sectionTitle}>Recent Lessons</Text>
            {progressData.slice(0, 5).map((p) => {
              const section = p.sectionId as any;
              return (
                <TouchableOpacity
                  key={p._id}
                  style={[styles.recentCard, { backgroundColor: colors.surface }]}
                  onPress={() => router.push({ pathname: '/books/section/[id]', params: { id: section._id } })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(p.status) }]} />
                  <View style={styles.recentInfo}>
                    <Text variant="body" color={colors.text} style={styles.recentTitle} numberOfLines={1}>
                      {section.title}
                    </Text>
                    <Text variant="bodySmall" color={colors.textSecondary}>
                      {section.unitId.title} • {new Date(p.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    marginBottom: SPACING.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  bookCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  percentageText: {
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    width: '100%',
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  bookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statusIndicator: {
    width: 4,
    height: 30,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.md,
  },
  recentInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  recentTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  emptyCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
  },
  emptyTitle: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    textAlign: 'center',
  }
});


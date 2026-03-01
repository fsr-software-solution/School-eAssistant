import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SPACING, BORDER_RADIUS } from '../../../constants/config';
import { useTheme } from '../../../context/ThemeContext';
import Text from '../../../components/ui/Text';
import { booksService, Unit, Section } from '../../../services/books';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useContentProtection, textProtectionProps } from '../../../utils/contentProtection';
import AskAISection from '../../../components/AskAISection';

export default function UnitDetailsScreen() {
  const router = useRouter();
  const { id, bookId } = useLocalSearchParams<{ id: string; bookId: string }>();
  const { colors } = useTheme();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // Enable content protection for this screen
  useContentProtection(true);

  useEffect(() => {
    if (id) {
      loadUnitData();
    }
  }, [id]);

  const loadUnitData = async () => {
    try {
      setLoading(true);
      const [unitData, sectionsData] = await Promise.all([
        booksService.getUnitById(id!),
        booksService.getUnitSections(id!),
      ]);
      setUnit(unitData);
      setSections(sectionsData);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error Loading Unit',
        text2: error.message || 'Failed to load unit details',
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSectionPress = (section: Section) => {
    router.push({
      pathname: '/books/section/[id]',
      params: { id: section._id, unitId: id, bookId: bookId },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body" color={colors.textSecondary} style={styles.loadingText}>Loading unit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!unit) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.unitBadge, { backgroundColor: colors.primaryLight + '20' }]}>
            <Text variant="body" color={colors.primary} style={styles.unitBadgeText}>Unit {unit.unitNumber}</Text>
          </View>
          <Text variant="h1" color={colors.text} style={styles.title}>{unit.title}</Text>
          <Text variant="body" color={colors.textSecondary} style={styles.pageRange}>
            Pages {unit.startingPage} - {unit.endingPage}
          </Text>
        </View>

        {/* Summary */}
        {unit.summary && (
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text variant="h3" color={colors.text} style={styles.summaryTitle}>Summary</Text>
            <Text variant="body" color={colors.textSecondary} style={styles.summaryText} {...textProtectionProps}>
              {unit.summary}
            </Text>
          </View>
        )}

        {/* Sections */}
        <View style={styles.sectionsSection}>
          <View style={styles.sectionHeader}>
            <Text variant="h2" color={colors.text} style={styles.sectionTitle}>Sections</Text>
            <Text variant="body" color={colors.textSecondary} style={styles.sectionCount}>
              {sections.length} {sections.length === 1 ? 'section' : 'sections'}
            </Text>
          </View>

          {sections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="body" color={colors.textSecondary} style={styles.emptyText}>No sections available</Text>
            </View>
          ) : (
            sections.map((section) => (
              <TouchableOpacity
                key={section._id}
                style={[styles.sectionCard, { backgroundColor: colors.surface }]}
                onPress={() => handleSectionPress(section)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeaderContent}>
                  <View style={[styles.sectionNumber, { backgroundColor: colors.primaryLight + '20' }]}>
                    <Text variant="bodySmall" color={colors.primary} style={styles.sectionNumberText}>{section.sectionNumber}</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <Text variant="body" color={colors.text} style={styles.sectionTitleText} numberOfLines={2}>
                      {section.title}
                    </Text>
                    <Text variant="bodySmall" color={colors.textSecondary} style={styles.sectionPages}>
                      Pages {section.startingPage} - {section.endingPage}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Ask AI Section */}
        <AskAISection
          contextTitle={unit.title}
          contextType="unit"
          contextId={id!}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  unitBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  unitBadgeText: {
    fontWeight: '600',
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  pageRange: {
  },
  summaryCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  summaryTitle: {
    marginBottom: SPACING.sm,
  },
  summaryText: {
    lineHeight: 24,
  },
  sectionsSection: {
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
  },
  sectionCount: {
  },
  sectionCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionNumber: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sectionNumberText: {
    fontWeight: '600',
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitleText: {
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  sectionPages: {
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
  },
});




import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../constants/config';
import { booksService, Unit, Section } from '../../../services/books';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useContentProtection, textProtectionProps } from '../../../utils/contentProtection';

export default function UnitDetailsScreen() {
  const router = useRouter();
  const { id, bookId } = useLocalSearchParams<{ id: string; bookId: string }>();

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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading unit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!unit) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.unitBadge}>
            <Text style={styles.unitBadgeText}>Unit {unit.unitNumber}</Text>
          </View>
          <Text style={styles.title}>{unit.title}</Text>
          <Text style={styles.pageRange}>
            Pages {unit.startingPage} - {unit.endingPage}
          </Text>
        </View>

        {/* Summary */}
        {unit.summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summaryText} {...textProtectionProps}>
              {unit.summary}
            </Text>
          </View>
        )}

        {/* Sections */}
        <View style={styles.sectionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sections</Text>
            <Text style={styles.sectionCount}>
              {sections.length} {sections.length === 1 ? 'section' : 'sections'}
            </Text>
          </View>

          {sections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No sections available</Text>
            </View>
          ) : (
            sections.map((section) => (
              <TouchableOpacity
                key={section._id}
                style={styles.sectionCard}
                onPress={() => handleSectionPress(section)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeaderContent}>
                  <View style={styles.sectionNumber}>
                    <Text style={styles.sectionNumberText}>{section.sectionNumber}</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <Text style={styles.sectionTitleText} numberOfLines={2}>
                      {section.title}
                    </Text>
                    <Text style={styles.sectionPages}>
                      Pages {section.startingPage} - {section.endingPage}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  unitBadge: {
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  unitBadgeText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  pageRange: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  summaryTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  summaryText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
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
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  sectionCount: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
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
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sectionNumberText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  sectionPages: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});



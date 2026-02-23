import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../constants/config';
import { booksService, Section } from '../../../services/books';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useContentProtection, textProtectionProps } from '../../../utils/contentProtection';
import Button from '../../../components/ui/Button';

export default function SectionReaderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user } = useAuth();
  const [section, setSection] = useState<Section | null>(null);
  const [subsections, setSubsections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressStatus, setProgressStatus] = useState<'not started' | 'in progress' | 'completed'>('not started');
  const [updatingProgress, setUpdatingProgress] = useState(false);

  // Enable content protection - prevent screenshots and text selection
  useContentProtection(true);

  useEffect(() => {
    if (id) {
      loadSectionData();
    }
  }, [id]);

  const loadSectionData = async () => {
    try {
      setLoading(true);
      const [sectionData, subsectionsData] = await Promise.all([
        booksService.getSectionById(id!),
        booksService.getSectionSubsections(id!).catch(() => []), // Subsections may not exist
      ]);
      setSection(sectionData);
      setSubsections(subsectionsData);
      
      // Load progress status if user is logged in
      // Note: You may need to implement a getProgressBySection endpoint
      // For now, we'll default to 'not started'
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error Loading Section',
        text2: error.message || 'Failed to load section content',
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !section) return;

    try {
      setUpdatingProgress(true);
      // Mark as completed
      // Note: You'll need to implement the progress API call
      // For now, we'll just update local state
      setProgressStatus('completed');
      Toast.show({
        type: 'success',
        text1: 'Progress Updated',
        text2: 'Section marked as completed',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update progress',
      });
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Format content with basic HTML-like tags support
  const formatContent = (content: string) => {
    // Simple formatting - replace line breaks and basic structure
    return content.split('\n').map((line, index) => {
      if (line.trim() === '') return null;
      
      // Check for headings (lines that are short and might be headings)
      if (line.length < 100 && !line.includes('.')) {
        return (
          <Text key={index} style={styles.heading} {...textProtectionProps}>
            {line.trim()}
          </Text>
        );
      }
      
      return (
        <Text key={index} style={styles.paragraph} {...textProtectionProps}>
          {line.trim()}
        </Text>
      );
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!section) {
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
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{section.sectionNumber}</Text>
          </View>
          <Text style={styles.title} {...textProtectionProps}>
            {section.title}
          </Text>
          <Text style={styles.pageInfo}>
            Pages {section.startingPage} - {section.endingPage}
          </Text>
        </View>

        {/* AI Clarification */}
        {section.aiClarification && (
          <View style={styles.clarificationCard}>
            <View style={styles.clarificationHeader}>
              <Ionicons name="bulb" size={20} color={COLORS.warning} />
              <Text style={styles.clarificationTitle}>AI Clarification</Text>
            </View>
            <Text style={styles.clarificationText} {...textProtectionProps}>
              {section.aiClarification}
            </Text>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>Content</Text>
          <View style={styles.contentText}>
            {formatContent(section.content)}
          </View>
        </View>

        {/* Subsections */}
        {subsections.length > 0 && (
          <View style={styles.subsectionsSection}>
            <Text style={styles.subsectionsTitle}>Subsections</Text>
            {subsections.map((subsection) => (
              <View key={subsection._id} style={styles.subsectionCard}>
                <Text style={styles.subsectionNumber}>{subsection.sectionNumber}</Text>
                <Text style={styles.subsectionTitle} {...textProtectionProps}>
                  {subsection.title}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        {section.summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summaryText} {...textProtectionProps}>
              {section.summary}
            </Text>
          </View>
        )}

        {/* Progress Tracking */}
        {user && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Ionicons 
                name={progressStatus === 'completed' ? 'checkmark-circle' : 'bookmark-outline'} 
                size={24} 
                color={progressStatus === 'completed' ? COLORS.success : COLORS.primary} 
              />
              <Text style={styles.progressTitle}>
                {progressStatus === 'completed' ? 'Completed' : progressStatus === 'in progress' ? 'In Progress' : 'Not Started'}
              </Text>
            </View>
            {progressStatus !== 'completed' && (
              <Button
                title={progressStatus === 'not started' ? 'Mark as In Progress' : 'Mark as Completed'}
                onPress={handleMarkComplete}
                loading={updatingProgress}
                style={styles.progressButton}
              />
            )}
          </View>
        )}
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
  sectionBadge: {
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  sectionBadgeText: {
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
  pageInfo: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  clarificationCard: {
    backgroundColor: COLORS.warning + '15',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  clarificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clarificationTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  clarificationText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  contentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  contentTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  contentText: {
    marginTop: SPACING.sm,
  },
  heading: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  paragraph: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: SPACING.md,
  },
  subsectionsSection: {
    marginBottom: SPACING.lg,
  },
  subsectionsTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  subsectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subsectionNumber: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.sm,
    minWidth: 30,
  },
  subsectionTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
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
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  progressButton: {
    marginTop: SPACING.sm,
  },
});

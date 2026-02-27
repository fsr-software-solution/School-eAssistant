import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SPACING, BORDER_RADIUS } from '../../../constants/config';
import { useTheme } from '../../../context/ThemeContext';
import Text from '../../../components/ui/Text';
import { booksService, Section, Resource } from '../../../services/books';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useContentProtection, textProtectionProps } from '../../../utils/contentProtection';
import Button from '../../../components/ui/Button';

export default function SectionReaderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user } = useAuth();
  const { colors } = useTheme();
  const [section, setSection] = useState<Section | null>(null);
  const [subsections, setSubsections] = useState<Section[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
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
      // Step 1: Fetch section first — this triggers the backend to generate
      // AI clarification, summary, and resources if they don't exist yet
      const sectionData = await booksService.getSectionById(id!);
      setSection(sectionData);

      // Step 2: Now fetch subsections and resources in parallel
      // Resources should be ready now since getSectionById triggers their generation
      const [subsectionsData, resourcesData] = await Promise.all([
        booksService.getSectionSubsections(id!).catch(() => []),
        booksService.getSectionResources(id!).catch(() => []),
      ]);
      setSubsections(subsectionsData);
      setResources(resourcesData);

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

  const handleOpenResource = async (link: string) => {
    try {
      const supported = await Linking.canOpenURL(link);
      if (supported) {
        await Linking.openURL(link);
      } else {
        Toast.show({ type: 'error', text1: 'Cannot open link' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to open link' });
    }
  };

  const getResourceIcon = (type: Resource['type']): any => {
    switch (type) {
      case 'youtube': return 'logo-youtube';
      case 'article': return 'document-text-outline';
      case 'image': return 'image-outline';
      default: return 'link-outline';
    }
  };

  const getResourceColor = (type: Resource['type']): string => {
    switch (type) {
      case 'youtube': return '#FF0000';
      case 'article': return colors.primary;
      case 'image': return '#8B5CF6';
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body" color={colors.textSecondary} style={styles.loadingText}>Loading content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!section) {
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
          <View style={[styles.sectionBadge, { backgroundColor: colors.primaryLight + '20' }]}>
            <Text variant="body" color={colors.primary} style={styles.sectionBadgeText}>{section.sectionNumber}</Text>
          </View>
          <Text variant="h1" color={colors.text} style={styles.title} {...textProtectionProps}>
            {section.title}
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.pageInfo}>
            Pages {section.startingPage} - {section.endingPage}
          </Text>
        </View>

        {/* AI Clarification */}
        {section.aiClarification && (
          <View style={[styles.clarificationCard, { backgroundColor: colors.warning + '15', borderLeftColor: colors.warning }]}>
            <View style={styles.clarificationHeader}>
              <Ionicons name="bulb" size={20} color={colors.warning} />
              <Text variant="h3" color={colors.text} style={styles.clarificationTitle}>AI Clarification</Text>
            </View>
            <Text variant="body" color={colors.textSecondary} style={styles.clarificationText} {...textProtectionProps}>
              {section.aiClarification}
            </Text>
          </View>
        )}

        {/* Resources & References */}
        {resources.length > 0 && (
          <View style={styles.resourcesSection}>
            <View style={styles.resourcesSectionHeader}>
              <Ionicons name="library-outline" size={20} color={colors.primary} />
              <Text variant="h2" color={colors.text} style={styles.resourcesTitle}>Resources & References</Text>
            </View>
            {resources.map((resource) => (
              <TouchableOpacity
                key={resource._id}
                style={[styles.resourceCard, { backgroundColor: colors.surface }]}
                onPress={() => handleOpenResource(resource.link)}
                activeOpacity={0.7}
              >
                <View style={[styles.resourceIcon, { backgroundColor: getResourceColor(resource.type) + '20' }]}>
                  <Ionicons name={getResourceIcon(resource.type)} size={22} color={getResourceColor(resource.type)} />
                </View>
                <View style={styles.resourceInfo}>
                  <Text variant="body" color={colors.text} style={styles.resourceName} numberOfLines={1}>
                    {resource.title}
                  </Text>
                  {resource.description ? (
                    <Text variant="bodySmall" color={colors.textSecondary} numberOfLines={2}>
                      {resource.description}
                    </Text>
                  ) : (
                    <Text variant="bodySmall" color={colors.textSecondary}>
                      {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                    </Text>
                  )}
                </View>
                <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Subsections */}
        {subsections.length > 0 && (
          <View style={styles.subsectionsSection}>
            <Text variant="h2" color={colors.text} style={styles.subsectionsTitle}>Subsections</Text>
            {subsections.map((subsection) => (
              <TouchableOpacity
                key={subsection._id}
                style={[styles.subsectionCard, { backgroundColor: colors.surface }]}
                onPress={() => router.push({ pathname: '/books/section/[id]', params: { id: subsection._id } })}
                activeOpacity={0.7}
              >
                <View style={[styles.subsectionNumberContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                  <Text variant="bodySmall" color={colors.primary} style={styles.subsectionNumber}>{subsection.sectionNumber}</Text>
                </View>
                <Text variant="body" color={colors.text} style={styles.subsectionTitle} {...textProtectionProps}>
                  {subsection.title}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Summary */}
        {section.summary && (
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text variant="h3" color={colors.text} style={styles.summaryTitle}>Summary</Text>
            <Text variant="body" color={colors.textSecondary} style={styles.summaryText} {...textProtectionProps}>
              {section.summary}
            </Text>
          </View>
        )}

        {/* Progress Tracking */}
        {user && (
          <View style={[styles.progressCard, { backgroundColor: colors.surface, borderTopColor: colors.primary }]}>
            <View style={styles.progressHeader}>
              <Ionicons
                name={progressStatus === 'completed' ? 'checkmark-circle' : 'bookmark-outline'}
                size={24}
                color={progressStatus === 'completed' ? colors.success : colors.primary}
              />
              <Text variant="h3" color={colors.text} style={styles.progressTitle}>
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
  sectionBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  sectionBadgeText: {
    fontWeight: '600',
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  pageInfo: {
  },
  clarificationCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
  },
  clarificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clarificationTitle: {
    marginLeft: SPACING.sm,
  },
  clarificationText: {
    lineHeight: 24,
  },
  resourcesSection: {
    marginBottom: SPACING.lg,
  },
  resourcesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  resourcesTitle: {
    marginLeft: SPACING.xs,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  resourceInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  resourceName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  subsectionsSection: {
    marginBottom: SPACING.lg,
  },
  subsectionsTitle: {
    marginBottom: SPACING.md,
  },
  subsectionCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subsectionNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  subsectionNumber: {
    fontWeight: '600',
  },
  subsectionTitle: {
    flex: 1,
  },
  summaryCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  summaryTitle: {
    marginBottom: SPACING.sm,
  },
  summaryText: {
    lineHeight: 24,
  },
  progressCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderTopWidth: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    marginLeft: SPACING.sm,
  },
  progressButton: {
    marginTop: SPACING.sm,
  },
});

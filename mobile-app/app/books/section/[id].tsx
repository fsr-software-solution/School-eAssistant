import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Animated, Modal, TouchableWithoutFeedback } from 'react-native';
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
import YouTubePlayer from '../../../components/ui/YouTubePlayer';
import ImageViewer from '../../../components/ui/ImageViewer';
import AskAISection from '../../../components/AskAISection';
import { translationService, Language } from '../../../services/translation';
import Markdown from 'react-native-markdown-display';
import { progressService, ProgressStatus } from '../../../services/progress';


// Custom styles for Markdown based on theme
const markdownStyles = (colors: any) => ({
  body: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold' as const,
    marginBottom: 10,
  },
  heading2: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 10,
  },
  strong: {
    fontWeight: 'bold' as const,
  },
  em: {
    fontStyle: 'italic' as const,
  },
  list_item: {
    marginBottom: 5,
  },
  bullet_list: {
    marginBottom: 10,
  },
  ordered_list: {
    marginBottom: 10,
  },
});

// Accordion Section Component
const AccordionSection = ({
  title,
  isOpen,
  onPress,
  icon,
  iconColor,
  children
}: {
  title: string;
  isOpen: boolean;
  onPress: () => void;
  icon: string;
  iconColor: string;
  children: React.ReactNode;
}) => {
  const { colors } = useTheme();
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  const animatedStyle = {
    maxHeight: animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1000],
    }),
    opacity: animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  return (
    <View style={[styles.accordionSection, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.accordionHeaderContent}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
          <Text variant="h3" color={colors.text} style={styles.accordionTitle}>
            {title}
          </Text>
        </View>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <Animated.View style={[styles.accordionContent, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
};

export default function SectionReaderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user } = useAuth();
  const { colors } = useTheme();
  const [section, setSection] = useState<Section | null>(null);
  const [subsections, setSubsections] = useState<Section[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('not started');
  const [currentProgressRecordId, setCurrentProgressRecordId] = useState<string | null>(null);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [isAutoCreating, setIsAutoCreating] = useState(false);


  // Translation states
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState('en');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // Accordion states
  const [accordionStates, setAccordionStates] = useState({
    clarifications: true,
    videos: true,
    images: true,
    articles: true,
  });

  // Enable content protection - prevent screenshots and text selection
  useContentProtection(true);

  useEffect(() => {
    if (id) {
      loadSectionData();
    }
  }, [id, user]);

  const loadSectionData = async () => {
    try {
      setLoading(true);
      const sectionData = await booksService.getSectionById(id!);
      setSection(sectionData);

      const [subsectionsData, resourcesData] = await Promise.all([
        booksService.getSectionSubsections(id!).catch(() => []),
        booksService.getSectionResources(id!).catch(() => []),
      ]);
      setSubsections(subsectionsData);
      setResources(resourcesData);

      // Fetch Ethiopian languages
      try {
        const langs = await translationService.getEthiopianLanguages();
        setLanguages(langs);
      } catch (error) {
        console.error('Failed to load languages', error);
      }

      if (user && !isAutoCreating) {
        try {
          const userProgress = await progressService.getStudentProgress(user.id);
          // Fixed comparison: convert to string to handle ObjectId objects or string IDs
          const sectionProgress = userProgress.find(p => String(p.sectionId) === id);

          if (sectionProgress) {
            setProgressStatus(sectionProgress.status);
            setCurrentProgressRecordId(sectionProgress._id);
          } else {
            // Auto-create "in progress" when viewing section if not already present
            try {
              setIsAutoCreating(true);
              const newProgress = await progressService.createProgress(user.id, id!, 'in progress');
              setProgressStatus(newProgress.status);
              setCurrentProgressRecordId(newProgress._id);
            } catch (createErr: any) {
              const errorMessage = createErr.response?.data?.message || createErr.message || '';
              // If it already exists (race condition or someone created it in between), try a silent re-fetch
              if (errorMessage.includes('already exists')) {
                const refreshedProgress = await progressService.getStudentProgress(user.id);
                const found = refreshedProgress.find(p => String(p.sectionId) === id);
                if (found) {
                  setProgressStatus(found.status);
                  setCurrentProgressRecordId(found._id);
                }
              } else {
                console.error('Failed to auto-create progress', createErr);
              }
            } finally {
              setIsAutoCreating(false);
            }
          }
        } catch (error) {
          console.error('Failed to load or create progress', error);
        }
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load section content';
      Toast.show({
        type: 'error',
        text1: 'Error Loading Section',
        text2: errorMessage,
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !section || !id) return;

    try {
      setUpdatingProgress(true);
      const newStatus: ProgressStatus = progressStatus === 'not started' ? 'in progress' : 'completed';

      if (currentProgressRecordId) {
        const updated = await progressService.updateProgress(currentProgressRecordId, newStatus);
        setProgressStatus(updated.status);
      } else {
        try {
          const created = await progressService.createProgress(user.id, id, newStatus);
          setProgressStatus(created.status);
          setCurrentProgressRecordId(created._id);
        } catch (createErr: any) {
          const errorMessage = createErr.response?.data?.message || createErr.message || '';
          // If it fails with "already exists", it means it was created in the background
          // (e.g., during loadSectionData auto-creation)
          if (errorMessage.includes('already exists')) {
            const refreshed = await progressService.getStudentProgress(user.id);
            const found = refreshed.find(p => String(p.sectionId) === id);
            if (found) {
              // If it matches, we'll try to update it instead
              const updated = await progressService.updateProgress(found._id, newStatus);
              setProgressStatus(updated.status);
              setCurrentProgressRecordId(updated._id);
            }
          } else {
            throw createErr;
          }
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Progress Updated',
        text2: `Section marked as ${newStatus}`,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update progress';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
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

  // Helper function to extract YouTube video ID from URL
  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Toggle accordion function
  const toggleAccordion = (section: keyof typeof accordionStates) => {
    setAccordionStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTranslate = async (langCode: string) => {
    if (langCode === 'en' || langCode === 'english') {
      setSelectedLanguageCode('en');
      setTranslatedText(null);
      return;
    }

    if (!section?.aiClarification) return;

    try {
      setTranslating(true);
      setSelectedLanguageCode(langCode);
      const translated = await translationService.translateText(section.aiClarification, langCode);
      setTranslatedText(translated);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Translation Failed',
        text2: error.message || 'Could not translate text',
      });
      setSelectedLanguageCode('en');
      setTranslatedText(null);
    } finally {
      setTranslating(false);
      setShowLanguagePicker(false);
    }
  };

  const getLanguageName = (code: string) => {
    if (code === 'en' || code === 'english') return 'English';
    const lang = languages.find(l => l.code === code || l.lang === code);
    return lang ? lang.language : code;
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

        {/* Accordion Sections */}
        {section.aiClarification && (
          <AccordionSection
            title="Clarifications"
            isOpen={accordionStates.clarifications}
            onPress={() => toggleAccordion('clarifications')}
            icon="bulb"
            iconColor={colors.warning}
          >
            <View style={[styles.clarificationCard, { backgroundColor: colors.warning + '15', borderLeftColor: colors.warning }]}>
              {/* Language Selector Dropdown */}
              <View style={styles.translationHeader}>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: colors.surface, borderColor: colors.warning + '40' }]}
                  onPress={() => setShowLanguagePicker(true)}
                  activeOpacity={0.7}
                  disabled={translating}
                >
                  <Ionicons name="language" size={16} color={colors.warning} />
                  <Text variant="bodySmall" color={colors.text} style={styles.dropdownButtonText}>
                    {getLanguageName(selectedLanguageCode)}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                </TouchableOpacity>

                {translating && (
                  <View style={styles.translatingIndicator}>
                    <ActivityIndicator size="small" color={colors.warning} />
                  </View>
                )}
              </View>

              {/* Language Picker Modal */}
              <Modal
                visible={showLanguagePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLanguagePicker(false)}
              >
                <TouchableWithoutFeedback onPress={() => setShowLanguagePicker(false)}>
                  <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                      <View style={[styles.dropdownMenu, { backgroundColor: colors.surface }]}>
                        <Text variant="h3" color={colors.text} style={styles.dropdownMenuTitle}>Select Language</Text>

                        <TouchableOpacity
                          style={[styles.dropdownItem, selectedLanguageCode === 'en' && { backgroundColor: colors.warning + '20' }]}
                          onPress={() => handleTranslate('en')}
                        >
                          <Text variant="body" color={selectedLanguageCode === 'en' ? colors.warning : colors.text}>English</Text>
                          {selectedLanguageCode === 'en' && <Ionicons name="checkmark" size={20} color={colors.warning} />}
                        </TouchableOpacity>

                        {languages.filter(l => l.code !== 'en' && l.lang !== 'english').map((lang) => (
                          <TouchableOpacity
                            key={lang.code}
                            style={[styles.dropdownItem, selectedLanguageCode === lang.code && { backgroundColor: colors.warning + '20' }]}
                            onPress={() => handleTranslate(lang.code)}
                          >
                            <Text variant="body" color={selectedLanguageCode === lang.code ? colors.warning : colors.text}>
                              {lang.language}
                            </Text>
                            {selectedLanguageCode === lang.code && <Ionicons name="checkmark" size={20} color={colors.warning} />}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>

              {translating ? (
                <View style={styles.translatingContainer}>
                  <Text variant="bodySmall" color={colors.textSecondary}>Translating clarification...</Text>
                </View>
              ) : (
                <View {...textProtectionProps}>
                  <Markdown style={markdownStyles(colors)}>
                    {translatedText || section.aiClarification || ''}
                  </Markdown>
                </View>
              )}
            </View>
          </AccordionSection>
        )}

        {/* Videos Section */}
        {resources.filter(r => r.type === 'youtube').length > 0 && (
          <AccordionSection
            title="Videos"
            isOpen={accordionStates.videos}
            onPress={() => toggleAccordion('videos')}
            icon="logo-youtube"
            iconColor="#FF0000"
          >
            {resources.filter(r => r.type === 'youtube').map((resource) => {
              const videoId = extractYouTubeVideoId(resource.link);
              if (videoId) {
                return (
                  <View key={resource._id} style={styles.resourceCard}>
                    <YouTubePlayer videoId={videoId} />
                  </View>
                );
              }
              return null;
            })}
          </AccordionSection>
        )}

        {/* Images Section */}
        {resources.filter(r => r.type === 'image').length > 0 && (
          <AccordionSection
            title="Images"
            isOpen={accordionStates.images}
            onPress={() => toggleAccordion('images')}
            icon="image-outline"
            iconColor="#8B5CF6"
          >
            {resources.filter(r => r.type === 'image').map((resource) => (
              <View key={resource._id} style={styles.resourceCard}>
                <ImageViewer
                  imageUrl={resource.link}
                  title={resource.title}
                  description={resource.description}
                  onOpen={() => console.log('Image opened')}
                  onClose={() => console.log('Image closed')}
                />
              </View>
            ))}
          </AccordionSection>
        )}

        {/* Articles Section */}
        {resources.filter(r => r.type === 'article').length > 0 && (
          <AccordionSection
            title="Articles"
            isOpen={accordionStates.articles}
            onPress={() => toggleAccordion('articles')}
            icon="document-text-outline"
            iconColor={colors.primary}
          >
            {resources.filter(r => r.type === 'article').map((resource) => (
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
                      Article
                    </Text>
                  )}
                </View>
                <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </AccordionSection>
        )}

        {/* Ask AI Section */}
        <AskAISection
          contextTitle={section.title}
          contextType="section"
          contextId={id!}
        />

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
  accordionSection: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'transparent',
  },
  accordionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accordionTitle: {
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  accordionContent: {
    overflow: 'hidden',
  },
  translationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  dropdownButtonText: {
    fontWeight: '600',
    minWidth: 80,
  },
  translatingIndicator: {
    paddingRight: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  dropdownMenu: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownMenuTitle: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  translatingContainer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
});

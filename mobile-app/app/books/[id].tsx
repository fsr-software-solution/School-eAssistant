import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SPACING, BORDER_RADIUS } from '../../constants/config';
import { useTheme } from '../../context/ThemeContext';
import Text from '../../components/ui/Text';
import { Platform } from 'react-native';
import { booksService, Book, Unit } from '../../services/books';
import UnitCard from '../../components/books/UnitCard';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Button from '../../components/ui/Button';

export default function BookDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [book, setBook] = useState<Book | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBookData();
    }
  }, [id]);

  const loadBookData = async () => {
    try {
      setLoading(true);
      const [bookData, unitsData] = await Promise.all([
        booksService.getBookById(id!),
        booksService.getBookUnits(id!),
      ]);
      setBook(bookData);
      setUnits(unitsData);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error Loading Book',
        text2: error.message || 'Failed to load book details',
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUnitPress = (unit: Unit) => {
    router.push({
      pathname: '/books/unit/[id]',
      params: { id: unit._id, bookId: id },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body" color={colors.textSecondary} style={styles.loadingText}>Loading book details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!book) {
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
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
            <Ionicons name="library" size={48} color={colors.primary} />
          </View>
          <Text variant="h1" color={colors.text} style={styles.subject}>{book.subject}</Text>
          <Text variant="body" color={colors.textSecondary} style={styles.meta}>
            {book.gradeLevel} • {book.yearOfPublish} • {book.totalPages} pages
          </Text>
        </View>

        {/* Summary */}
        {book.summary && (
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text variant="h3" color={colors.text} style={styles.summaryTitle}>About this book</Text>
            <Text variant="body" color={colors.textSecondary} style={styles.summaryText}>{book.summary}</Text>
          </View>
        )}

        {/* Units Section */}
        <View style={styles.unitsSection}>
          <View style={styles.sectionHeader}>
            <Text variant="h2" color={colors.text} style={styles.sectionTitle}>Units</Text>
            <Text variant="body" color={colors.textSecondary} style={styles.unitCount}>{units.length} {units.length === 1 ? 'unit' : 'units'}</Text>
          </View>

          {units.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="body" color={colors.textSecondary} style={styles.emptyText}>No units available</Text>
            </View>
          ) : (
            units.map((unit) => (
              <UnitCard key={unit._id} unit={unit} onPress={() => handleUnitPress(unit)} />
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  subject: {
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  meta: {
    textAlign: 'center',
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
  unitsSection: {
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
  unitCount: {
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
  },
});


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/config';
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading book details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!book) {
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
          <View style={styles.iconContainer}>
            <Ionicons name="library" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.subject}>{book.subject}</Text>
          <Text style={styles.meta}>
            {book.gradeLevel} • {book.yearOfPublish} • {book.totalPages} pages
          </Text>
        </View>

        {/* Summary */}
        {book.summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>About this book</Text>
            <Text style={styles.summaryText}>{book.summary}</Text>
          </View>
        )}

        {/* Units Section */}
        <View style={styles.unitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Units</Text>
            <Text style={styles.unitCount}>{units.length} {units.length === 1 ? 'unit' : 'units'}</Text>
          </View>

          {units.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No units available</Text>
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  subject: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  meta: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  unitCount: {
    ...TYPOGRAPHY.body,
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


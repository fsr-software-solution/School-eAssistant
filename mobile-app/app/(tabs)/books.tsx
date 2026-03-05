import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SPACING } from '../../constants/config';
import { useTheme } from '../../context/ThemeContext';
import Text from '../../components/ui/Text';
import { Platform } from 'react-native';
import { booksService, Book } from '../../services/books';
import BookCard from '../../components/books/BookCard';
import SearchBar from '../../components/ui/SearchBar';
import Toast from 'react-native-toast-message';

export default function BooksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate bottom padding: tab bar height + safe area bottom
  const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
  const bottomPadding = tabBarHeight + insets.bottom + SPACING.md;

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    // Filter books based on search query
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = books.filter(
        (book) =>
          book.subject.toLowerCase().includes(query) ||
          book.gradeLevel.toLowerCase().includes(query) ||
          book.yearOfPublish.includes(query) ||
          (book.summary && book.summary.toLowerCase().includes(query))
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await booksService.getAllBooks();
      setBooks(data);
      setFilteredBooks(data);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error Loading Books',
        text2: error.message || 'Failed to load books',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  };

  const handleBookPress = (book: Book) => {
    router.push({
      pathname: '/books/[id]',
      params: { id: book._id },
    });
  };

  if (loading && books.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.loadingContainer, { paddingBottom: bottomPadding }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body" color={colors.textSecondary} style={styles.loadingText}>Loading books...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h1" color={colors.text} style={styles.title}>Books</Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>{filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by subject, grade, or year..."
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredBooks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="body" color={colors.textSecondary} style={styles.emptyText}>
              {searchQuery ? 'No books found matching your search' : 'No books available'}
            </Text>
          </View>
        ) : (
          filteredBooks.map((book) => (
            <BookCard key={book._id} book={book} onPress={() => handleBookPress(book)} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  subtitle: {
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    textAlign: 'center',
  },
});



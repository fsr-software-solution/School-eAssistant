import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS } from '../../constants/config';
import { useTheme } from '../../context/ThemeContext';
import Text from '../ui/Text';
import { Book } from '../../services/books';

interface BookCardProps {
  book: Book;
  onPress: () => void;
}

export default function BookCard({ book, onPress }: BookCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
        <Ionicons name="library" size={40} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <Text variant="h3" color={colors.text} style={styles.subject} numberOfLines={1}>
          {book.subject}
        </Text>
        <Text variant="bodySmall" color={colors.textSecondary} style={styles.gradeLevel}>
          {book.gradeLevel} • {book.yearOfPublish}
        </Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="document-text" size={14} color={colors.textSecondary} />
            <Text variant="bodySmall" color={colors.textSecondary} style={styles.metaText}>{book.totalPages} pages</Text>
          </View>
        </View>
        {book.summary && (
          <Text variant="bodySmall" color={colors.textSecondary} style={styles.summary} numberOfLines={2}>
            {book.summary}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  subject: {
    marginBottom: SPACING.xs,
  },
  gradeLevel: {
    marginBottom: SPACING.xs,
  },
  meta: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  metaText: {
    marginLeft: SPACING.xs,
  },
  summary: {
    marginTop: SPACING.xs,
  },
});


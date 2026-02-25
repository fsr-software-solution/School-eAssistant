import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS } from '../../constants/config';
import { useTheme } from '../../context/ThemeContext';
import Text from '../ui/Text';
import { Unit } from '../../services/books';

interface UnitCardProps {
  unit: Unit;
  onPress: () => void;
}

export default function UnitCard({ unit, onPress }: UnitCardProps) {
  const { colors } = useTheme();

  const pageRange = `${unit.startingPage}-${unit.endingPage}`;
  const totalPages = unit.endingPage - unit.startingPage + 1;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.unitNumber, { backgroundColor: colors.primaryLight + '20' }]}>
          <Text variant="bodySmall" color={colors.primary} style={styles.unitNumberText}>Unit {unit.unitNumber}</Text>
        </View>
        <View style={styles.pages}>
          <Ionicons name="document-text" size={14} color={colors.textSecondary} />
          <Text variant="bodySmall" color={colors.textSecondary} style={styles.pagesText}>{pageRange}</Text>
        </View>
      </View>

      <Text variant="h3" color={colors.text} style={styles.title} numberOfLines={2}>
        {unit.title}
      </Text>

      {unit.summary && (
        <Text variant="bodySmall" color={colors.textSecondary} style={styles.summary} numberOfLines={2}>
          {unit.summary}
        </Text>
      )}

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text variant="bodySmall" color={colors.textSecondary} style={styles.pageCount}>{totalPages} pages</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  unitNumber: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  unitNumberText: {
    fontWeight: '600',
  },
  pages: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pagesText: {
    marginLeft: SPACING.xs,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  summary: {
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  pageCount: {
  },
});


import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/config';
import { Unit } from '../../services/books';

interface UnitCardProps {
  unit: Unit;
  onPress: () => void;
}

export default function UnitCard({ unit, onPress }: UnitCardProps) {
  const pageRange = `${unit.startingPage}-${unit.endingPage}`;
  const totalPages = unit.endingPage - unit.startingPage + 1;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.unitNumber}>
          <Text style={styles.unitNumberText}>Unit {unit.unitNumber}</Text>
        </View>
        <View style={styles.pages}>
          <Ionicons name="document-text" size={14} color={COLORS.textSecondary} />
          <Text style={styles.pagesText}>{pageRange}</Text>
        </View>
      </View>
      
      <Text style={styles.title} numberOfLines={2}>
        {unit.title}
      </Text>
      
      {unit.summary && (
        <Text style={styles.summary} numberOfLines={2}>
          {unit.summary}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.pageCount}>{totalPages} pages</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  unitNumber: {
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  unitNumberText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
  },
  pages: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pagesText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  summary: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pageCount: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
});


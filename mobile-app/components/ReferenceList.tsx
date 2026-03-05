import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './ui/Text';
import { useTheme } from '../context/ThemeContext';
import { Reference } from '../services/chat';
import { SPACING, BORDER_RADIUS } from '../constants/config';

interface ReferenceListProps {
    references: Reference[];
}

export default function ReferenceList({ references }: ReferenceListProps) {
    const { colors } = useTheme();

    if (!references || references.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="library" size={16} color={colors.primary} />
                <Text variant="bodySmall" color={colors.primary} style={styles.headerText}>
                    STUDY REFERENCES
                </Text>
            </View>
            <View style={styles.list}>
                {references.map((ref, index) => {
                    const book = typeof ref.bookId === 'object' ? ref.bookId : null;
                    const bookTitle = book ? `${book.subject} (G-${book.gradeLevel.replace('G-', '')})` : 'Reference';
                    const location = [
                        ref.unitName ? `Unit: ${ref.unitName}` : null,
                        ref.sectionName ? `Section: ${ref.sectionName}` : null,
                        `Page: ${ref.pageNumber}`
                    ].filter(Boolean).join(' • ');

                    return (
                        <View key={ref._id} style={[styles.refCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.refIcon}>
                                <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
                            </View>
                            <View style={styles.refContent}>
                                <Text variant="bodySmall" color={colors.text} style={{ fontWeight: '700' }}>
                                    {bookTitle}
                                </Text>
                                <Text variant="bodySmall" color={colors.textSecondary} style={styles.locationText}>
                                    {location}
                                </Text>
                                {ref.quotedText && (
                                    <Text variant="bodySmall" color={colors.textSecondary} style={styles.quotedText} numberOfLines={2}>
                                        "{ref.quotedText.trim()}"
                                    </Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
        paddingHorizontal: SPACING.xs,
    },
    headerText: {
        fontWeight: '700',
        marginLeft: SPACING.xs,
        letterSpacing: 1,
    },
    list: {
        gap: SPACING.xs,
    },
    refCard: {
        flexDirection: 'row',
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        alignItems: 'flex-start',
        alignSelf: 'stretch',
    },
    refIcon: {
        marginTop: 2,
        marginRight: SPACING.sm,
    },
    refContent: {
        flex: 1,
    },
    locationText: {
        fontSize: 11,
        marginTop: 2,
    },
    quotedText: {
        fontSize: 11,
        fontStyle: 'italic',
        marginTop: 4,
        lineHeight: 14,
    },
});

import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Text from './ui/Text';
import Button from './ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chat';
import { SPACING, BORDER_RADIUS } from '../constants/config';
import Toast from 'react-native-toast-message';

interface AskAISectionProps {
    contextTitle: string;
    contextType: 'unit' | 'section';
    contextId: string;
}

export default function AskAISection({ contextTitle, contextType, contextId }: AskAISectionProps) {
    const { colors } = useTheme();
    const { isPremium, user } = useAuth();
    const router = useRouter();

    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAskAI = async () => {
        if (!question.trim()) return;
        if (!user) {
            Toast.show({ type: 'error', text1: 'Please log in to use this feature' });
            return;
        }

        try {
            setLoading(true);
            // Create a new chat session
            const session = await chatService.createChat(user.id, 'interaction');

            // Navigate to chat with the initial question as a param
            // We'll prepare a context-aware question
            const fullQuestion = `About ${contextType} "${contextTitle}": ${question}`;

            router.push({
                pathname: '/chat/[id]',
                params: {
                    id: session._id,
                    initialQuestion: fullQuestion,
                    sectionId: contextType === 'section' ? contextId : undefined
                }
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Failed to start chat',
                text2: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isPremium) {
        return (
            <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.lockHeader}>
                    <View style={[styles.lockCircle, { backgroundColor: colors.border }]}>
                        <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
                    </View>
                    <Text variant="h3" color={colors.text} style={styles.lockTitle}>Premium Feature</Text>
                </View>
                <Text variant="bodySmall" color={colors.textSecondary} style={styles.lockSubtitle}>
                    Ask our AI assistant any specific questions about this {contextType}. Upgrade to unlock deep insights and clarifications.
                </Text>
                <View style={styles.featureList}>
                    {['Context-aware AI assistance', 'Instant clarifications', 'Step-by-step explanations'].map((f, i) => (
                        <View key={i} style={styles.featureRow}>
                            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                            <Text variant="bodySmall" color={colors.text} style={styles.featureText}>{f}</Text>
                        </View>
                    ))}
                </View>
                <Button
                    title="🔓 Unlock Premium"
                    onPress={() => router.push('/premium')}
                    size="small"
                    style={styles.premiumBtn}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.accent + '30' }]}>
            <View style={styles.activeHeader}>
                <View style={[styles.aiCircle, { backgroundColor: colors.accent + '20' }]}>
                    <Ionicons name="sparkles" size={18} color={colors.accent} />
                </View>
                <Text variant="h3" color={colors.text}>Ask AI Assistant</Text>
            </View>
            <Text variant="bodySmall" color={colors.textSecondary} style={styles.description}>
                Got a question about this {contextType}? Ask away, and I'll help you understand it better.
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={`Ask about ${contextTitle}...`}
                    placeholderTextColor={colors.textSecondary}
                    value={question}
                    onChangeText={setQuestion}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[styles.sendBtn, { backgroundColor: question.trim() ? colors.accent : colors.disabled }]}
                    onPress={handleAskAI}
                    disabled={!question.trim() || loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="send" size={16} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginTop: SPACING.md,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    lockHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    lockCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    lockTitle: {
        fontWeight: '700',
    },
    lockSubtitle: {
        lineHeight: 18,
        marginBottom: SPACING.md,
    },
    featureList: {
        marginBottom: SPACING.md,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    featureText: {
        marginLeft: SPACING.xs,
    },
    premiumBtn: {
        marginTop: SPACING.xs,
    },
    activeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    aiCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    description: {
        marginBottom: SPACING.md,
        lineHeight: 18,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        paddingLeft: SPACING.md,
        paddingRight: SPACING.xs,
        paddingVertical: SPACING.xs,
    },
    input: {
        flex: 1,
        fontSize: 14,
        paddingVertical: SPACING.xs,
        maxHeight: 80,
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: SPACING.xs,
    },
});

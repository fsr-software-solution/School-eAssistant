import React, { useState, useEffect, useRef } from 'react';
import {
    View, StyleSheet, FlatList, ActivityIndicator,
    TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Text from '../../components/ui/Text';
import { useTheme } from '../../context/ThemeContext';
import { chatService, Interaction } from '../../services/chat';
import { useContentProtection } from '../../utils/contentProtection';
import { SPACING, BORDER_RADIUS } from '../../constants/config';

export default function ChatConversationScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);

    // Content protection: prevent screenshots in chat
    useContentProtection(true);

    const [messages, setMessages] = useState<Interaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => { if (id) loadMessages(); }, [id]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await chatService.getChatInteractions(id!);
            setMessages(data);
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Failed to load messages', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        const q = input.trim();
        if (!q) return;
        setInput('');
        setSending(true);

        // Optimistic: show the question immediately as a "sending" bubble
        const tempId = `temp-${Date.now()}`;
        const tempMsg: Interaction = {
            _id: tempId,
            chatSessionId: id!,
            studentId: '',
            studentQuestion: q,
            aiAnswer: '...',
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const response = await chatService.sendMessage(id!, q);
            setMessages((prev) => prev.map((m) => (m._id === tempId ? response : m)));
        } catch (error: any) {
            setMessages((prev) => prev.filter((m) => m._id !== tempId));
            Toast.show({ type: 'error', text1: 'Failed to send', text2: error.message });
        } finally {
            setSending(false);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const renderMessage = ({ item }: { item: Interaction }) => {
        const isLoading = item.aiAnswer === '...';
        return (
            <View style={styles.messageGroup}>
                {/* Student question */}
                <View style={styles.questionRow}>
                    <View style={[styles.bubble, styles.questionBubble, { backgroundColor: colors.primary }]}>
                        <Text variant="body" color="#fff" style={{ lineHeight: 22 }}>{item.studentQuestion}</Text>
                    </View>
                    <View style={[styles.avatar, { backgroundColor: colors.primary + '30' }]}>
                        <Ionicons name="person" size={16} color={colors.primary} />
                    </View>
                </View>

                {/* AI answer */}
                <View style={styles.answerRow}>
                    <View style={[styles.aiAvatar, { backgroundColor: colors.accent + '20' }]}>
                        <Ionicons name="hardware-chip" size={18} color={colors.accent} />
                    </View>
                    <View style={[styles.bubble, styles.answerBubble, { backgroundColor: colors.surface }]}>
                        {isLoading ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <ActivityIndicator size="small" color={colors.accent} />
                                <Text variant="bodySmall" color={colors.textSecondary}>Thinking...</Text>
                            </View>
                        ) : (
                            <>
                                <Text variant="body" color={colors.text} style={{ lineHeight: 22 }}>{item.aiAnswer}</Text>
                                {item.confidenceScore !== undefined && (
                                    <Text variant="bodySmall" color={colors.textSecondary} style={{ marginTop: SPACING.xs }}>
                                        Confidence: {Math.round(item.confidenceScore * 100)}%
                                    </Text>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Text variant="h3" color={colors.text}>AI Assistant</Text>
                    <Text variant="bodySmall" color={colors.textSecondary}>Ask me anything about your studies</Text>
                </View>
                <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
            </View>

            {/* Messages */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={[styles.aiAvatarLg, { backgroundColor: colors.accent + '20' }]}>
                                <Ionicons name="hardware-chip" size={40} color={colors.accent} />
                            </View>
                            <Text variant="h3" color={colors.text} style={{ marginTop: SPACING.md }}>How can I help?</Text>
                            <Text variant="body" color={colors.textSecondary} style={{ textAlign: 'center', lineHeight: 24, marginTop: SPACING.xs }}>
                                Ask me anything about your learning materials, homework, or concepts.
                            </Text>
                        </View>
                    }
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />
            )}

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={insets.bottom}
            >
                <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + SPACING.sm }]}>
                    <TextInput
                        style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="Ask a question..."
                        placeholderTextColor={colors.textSecondary}
                        value={input}
                        onChangeText={setInput}
                        multiline
                        maxLength={1000}
                        returnKeyType="send"
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, { backgroundColor: input.trim() && !sending ? colors.primary : colors.disabled }]}
                        onPress={handleSend}
                        disabled={!input.trim() || sending}
                    >
                        {sending
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Ionicons name="send" size={18} color="#fff" />}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
        borderBottomWidth: 1, borderBottomColor: '#0001',
    },
    onlineDot: { width: 10, height: 10, borderRadius: 5 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    messageList: { padding: SPACING.lg, flexGrow: 1, justifyContent: 'flex-end' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl },
    aiAvatarLg: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
    messageGroup: { marginBottom: SPACING.lg },
    questionRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginBottom: SPACING.xs },
    answerRow: { flexDirection: 'row', alignItems: 'flex-start' },
    bubble: { maxWidth: '80%', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md },
    questionBubble: { borderBottomRightRadius: 4 },
    answerBubble: { borderTopLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
    avatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginLeft: SPACING.xs },
    aiAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.xs },
    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end',
        paddingHorizontal: SPACING.md, paddingTop: SPACING.md,
        borderTopWidth: 1, gap: SPACING.sm,
    },
    textInput: {
        flex: 1, borderWidth: 1, borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        fontSize: 16, maxHeight: 120,
    },
    sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});

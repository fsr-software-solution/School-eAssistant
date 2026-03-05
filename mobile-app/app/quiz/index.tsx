import React, { useState, useEffect, useRef } from 'react';
import {
    View, StyleSheet, FlatList, ActivityIndicator,
    TouchableOpacity, Platform, TextInput, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { chatService, ChatSession } from '../../services/chat';
import { SPACING, BORDER_RADIUS } from '../../constants/config';

export default function QuizListScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [topic, setTopic] = useState('');
    const [numQ, setNumQ] = useState('5');
    const [creating, setCreating] = useState(false);

    const showCreateRef = useRef(showCreate);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        showCreateRef.current = showCreate;
    }, [showCreate]);

    useEffect(() => { loadSessions(); }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const all = await chatService.getAllChats();
            setSessions(all.filter((c) => c.type === 'quiz'));
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Failed to load quizzes', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!topic.trim()) {
            Toast.show({ type: 'error', text1: 'Please enter a topic' });
            return;
        }
        const n = parseInt(numQ, 10);
        if (isNaN(n) || n < 1 || n > 20) {
            Toast.show({ type: 'error', text1: 'Number of questions must be 1–20' });
            return;
        }
        try {
            setCreating(true);

            // Generate AbortController
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            const session = await chatService.createChat(user!.id, 'quiz', signal);

            // Generate quizzes immediately
            await chatService.generateQuizzes(session._id, topic.trim(), n, signal);

            setShowCreate(false);
            setTopic('');
            setNumQ('5');
            router.push({ pathname: '/quiz/[id]', params: { id: session._id } });
        } catch (error: any) {
            // Only show toast if it's NOT a cancellation
            if (error.name === 'CanceledError' || error.message === 'canceled') {
                console.log('Quiz creation cancelled by user');
                return;
            }
            Toast.show({ type: 'error', text1: 'Failed to create quiz', text2: error.message });
        } finally {
            setCreating(false);
            abortControllerRef.current = null;
        }
    };

    const handleDelete = (session: ChatSession) => {
        Alert.alert('Delete Quiz', 'Are you sure you want to delete this quiz session?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await chatService.deleteChat(session._id);
                        setSessions((prev) => prev.filter((s) => s._id !== session._id));
                    } catch {
                        Toast.show({ type: 'error', text1: 'Failed to delete' });
                    }
                },
            },
        ]);
    };

    const handleCancel = () => {
        // Abort ongoing request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setShowCreate(false);
        setTopic('');
        setNumQ('5');
    };

    const renderSession = ({ item }: { item: ChatSession }) => (
        <TouchableOpacity
            style={[styles.sessionCard, { backgroundColor: colors.surface }]}
            onPress={() => router.push({ pathname: '/quiz/[id]', params: { id: item._id } })}
            activeOpacity={0.8}
        >
            <View style={[styles.quizIcon, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="help-circle" size={24} color={colors.secondary} />
            </View>
            <View style={styles.sessionInfo}>
                <Text variant="body" color={colors.text} style={{ fontWeight: '600' }} numberOfLines={1}>
                    {item.summary || 'Quiz Session'}
                </Text>
                <Text variant="bodySmall" color={colors.textSecondary}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h2" color={colors.text}>My Quizzes</Text>
                <TouchableOpacity onPress={() => setShowCreate(true)}>
                    <Ionicons name="add-circle" size={28} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Create Quiz Modal */}
            {showCreate && (
                <View style={[styles.createBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text variant="h3" color={colors.text} style={{ marginBottom: SPACING.md }}>New Quiz</Text>
                    <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: SPACING.xs }}>Topic / Base Idea</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g. Photosynthesis, World War II..."
                        placeholderTextColor={colors.textSecondary}
                        value={topic}
                        onChangeText={setTopic}
                    />
                    <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: SPACING.xs }}>Number of Questions (1–20)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="5"
                        placeholderTextColor={colors.textSecondary}
                        value={numQ}
                        onChangeText={setNumQ}
                        keyboardType="number-pad"
                    />
                    <View style={styles.createActions}>
                        <Button
                            title="Cancel"
                            onPress={handleCancel}
                            variant="outline"
                            style={{ flex: 1, borderColor: colors.border }}
                        />
                        <Button
                            title={creating ? 'Generating...' : 'Start Quiz'}
                            onPress={handleCreate}
                            loading={creating}
                            style={styles.actionBtn}
                        />
                    </View>
                </View>
            )}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : sessions.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="help-circle-outline" size={64} color={colors.textSecondary} />
                    <Text variant="body" color={colors.textSecondary} style={styles.emptyText}>
                        No quizzes yet.{'\n'}Tap + to create your first quiz!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={sessions}
                    keyExtractor={(item) => item._id}
                    renderItem={renderSession}
                    contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + SPACING.lg }]}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    createBox: {
        margin: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md, borderWidth: 1,
    },
    input: {
        borderWidth: 1, borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md, marginBottom: SPACING.md, fontSize: 16,
    },
    createActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
    actionBtn: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
    emptyText: { marginTop: SPACING.md, textAlign: 'center', lineHeight: 24 },
    list: { padding: SPACING.lg },
    sessionCard: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
    },
    quizIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    sessionInfo: { flex: 1 },
});

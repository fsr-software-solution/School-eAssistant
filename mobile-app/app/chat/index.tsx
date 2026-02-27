import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, FlatList, ActivityIndicator,
    TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Text from '../../components/ui/Text';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { chatService, ChatSession } from '../../services/chat';
import { SPACING, BORDER_RADIUS } from '../../constants/config';

export default function ChatListScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => { loadSessions(); }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const all = await chatService.getAllChats();
            setSessions(all.filter((c) => c.type === 'interaction'));
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Failed to load chats', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = async () => {
        try {
            setCreating(true);
            const session = await chatService.createChat(user!.id, 'interaction');
            router.push({ pathname: '/chat/[id]', params: { id: session._id } });
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Failed to create chat', text2: error.message });
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = (session: ChatSession) => {
        Alert.alert('Delete Chat', 'Delete this chat session?', [
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

    const renderItem = ({ item }: { item: ChatSession }) => (
        <TouchableOpacity
            style={[styles.chatCard, { backgroundColor: colors.surface }]}
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item._id } })}
            activeOpacity={0.8}
        >
            <View style={[styles.avatar, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="chatbubbles" size={22} color={colors.accent} />
            </View>
            <View style={styles.chatInfo}>
                <Text variant="body" color={colors.text} style={{ fontWeight: '600' }} numberOfLines={1}>
                    {item.summary || 'New Conversation'}
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
                <Text variant="h2" color={colors.text}>AI Chat</Text>
                <TouchableOpacity onPress={handleNewChat} disabled={creating}>
                    {creating
                        ? <ActivityIndicator size="small" color={colors.primary} />
                        : <Ionicons name="add-circle" size={28} color={colors.primary} />}
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : sessions.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="chatbubble-ellipses-outline" size={64} color={colors.textSecondary} />
                    <Text variant="body" color={colors.textSecondary} style={styles.emptyText}>
                        No conversations yet.{'\n'}Tap + to start chatting with AI!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={sessions}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
    emptyText: { marginTop: SPACING.md, textAlign: 'center', lineHeight: 24 },
    list: { padding: SPACING.lg },
    chatCard: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
    },
    avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    chatInfo: { flex: 1 },
});

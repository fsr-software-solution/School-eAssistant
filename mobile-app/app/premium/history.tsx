import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Text from '../../components/ui/Text';
import { useTheme } from '../../context/ThemeContext';
import { paymentService, PaymentTransaction } from '../../services/payment';
import { SPACING, BORDER_RADIUS } from '../../constants/config';

function statusColor(status: string, colors: any) {
    if (status === 'approved') return colors.success;
    if (status === 'rejected') return colors.error;
    return colors.warning;
}

function statusIcon(status: string) {
    if (status === 'approved') return 'checkmark-circle';
    if (status === 'rejected') return 'close-circle';
    return 'time';
}

export default function PaymentHistoryScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [history, setHistory] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadHistory(); }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const data = await paymentService.getPaymentHistory();
            setHistory(data);
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Failed to load history', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: PaymentTransaction }) => {
        const plan = typeof item.planId === 'object' ? item.planId : null;
        const sc = statusColor(item.verificationStatus, colors);
        return (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.cardTop}>
                    <View style={[styles.statusIcon, { backgroundColor: sc + '20' }]}>
                        <Ionicons name={statusIcon(item.verificationStatus) as any} size={24} color={sc} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text variant="body" color={colors.text} style={{ fontWeight: '700' }}>
                            {plan?.planName ?? 'Premium Plan'}
                        </Text>
                        <Text variant="bodySmall" color={colors.textSecondary}>
                            Tx: {item.transactionId}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: sc + '20' }]}>
                        <Text variant="bodySmall" color={sc} style={{ fontWeight: '700', textTransform: 'capitalize' }}>
                            {item.verificationStatus}
                        </Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.detailRow}>
                    <Text variant="bodySmall" color={colors.textSecondary}>Amount Paid</Text>
                    <Text variant="body" color={colors.text} style={{ fontWeight: '600' }}>
                        {item.paidAmount} ETB
                    </Text>
                </View>
                {plan && (
                    <View style={styles.detailRow}>
                        <Text variant="bodySmall" color={colors.textSecondary}>Duration</Text>
                        <Text variant="body" color={colors.text}>{plan.durationDays} days</Text>
                    </View>
                )}
                {item.verificationStatus === 'approved' && item.expiresAt && (
                    <View style={styles.detailRow}>
                        <Text variant="bodySmall" color={colors.textSecondary}>Expires</Text>
                        <Text variant="body" color={colors.success}>
                            {new Date(item.expiresAt).toLocaleDateString()}
                        </Text>
                    </View>
                )}
                {item.verificationStatus === 'rejected' && item.rejectionReason && (
                    <View style={[styles.rejectionNote, { backgroundColor: colors.error + '12' }]}>
                        <Text variant="bodySmall" color={colors.error}>{item.rejectionReason}</Text>
                    </View>
                )}
                <Text variant="bodySmall" color={colors.textSecondary} style={{ marginTop: SPACING.xs }}>
                    {new Date(item.createdAt).toLocaleString()}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h2" color={colors.text}>Payment History</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : history.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
                    <Text variant="body" color={colors.textSecondary} style={{ marginTop: SPACING.md, textAlign: 'center' }}>
                        No payment history yet.{'\n'}Go premium to get started!
                    </Text>
                    <TouchableOpacity
                        style={[styles.premiumBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/premium')}
                    >
                        <Text variant="body" color="#fff" style={{ fontWeight: '700' }}>View Plans</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={history}
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
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
    list: { padding: SPACING.lg },
    card: {
        borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
    statusIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    cardInfo: { flex: 1 },
    statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
    divider: { height: 1, marginBottom: SPACING.sm },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
    rejectionNote: { borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, marginTop: SPACING.xs },
    premiumBtn: { marginTop: SPACING.lg, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.full },
});

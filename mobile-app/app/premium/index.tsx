import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Platform,
    TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { paymentService, PremiumPlan, PaymentAccount } from '../../services/payment';
import { SPACING, BORDER_RADIUS } from '../../constants/config';

export default function PremiumPlansScreen() {
    const { colors } = useTheme();
    const { isPremium, premiumData, checkPremium } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const tabBarHeight = Platform.OS === 'ios' ? 49 : 56;
    const bottomPadding = tabBarHeight + insets.bottom + SPACING.md;

    const [plans, setPlans] = useState<PremiumPlan[]>([]);
    const [account, setAccount] = useState<PaymentAccount | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch plans and account independently so one error doesn't block the other
            const [plansResult, accountResult] = await Promise.allSettled([
                paymentService.getActivePlans(),
                paymentService.getPaymentAccount(),
            ]);
            if (plansResult.status === 'fulfilled') {
                setPlans(plansResult.value);
            } else {
                console.error('Plans fetch error:', plansResult.reason?.message);
                Toast.show({
                    type: 'error',
                    text1: 'Could not load plans',
                    text2: plansResult.reason?.response?.data?.message || plansResult.reason?.message || 'Check your connection',
                });
            }
            if (accountResult.status === 'fulfilled') {
                setAccount(accountResult.value);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUploadScreenshot = async () => {
        if (!selectedPlan) {
            Toast.show({ type: 'error', text1: 'Please select a plan first' });
            return;
        }

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission needed', 'Please allow photo library access to upload a screenshot.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images' as any,
            quality: 0.8,
            allowsEditing: false,
        });

        if (result.canceled || !result.assets?.[0]) return;

        if (!phoneNumber || phoneNumber.trim().length < 9) {
            Toast.show({ type: 'error', text1: 'Phone number required', text2: 'Please enter a valid phone number for verification' });
            return;
        }

        try {
            setUploading(true);
            const data = await paymentService.uploadPaymentScreenshot(
                selectedPlan._id,
                result.assets[0].uri,
                phoneNumber
            );
            await checkPremium();
            Toast.show({
                type: 'success',
                text1: '🎉 Payment Verified!',
                text2: `Welcome to ${data.planName}! Premium access activated.`,
                visibilityTime: 4000,
            });
            router.replace('/premium/history');
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'Payment verification failed';
            Toast.show({ type: 'error', text1: 'Upload Failed', text2: msg, visibilityTime: 5000 });
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.crownBadge, { backgroundColor: '#F59E0B20' }]}>
                        <Ionicons name="diamond" size={28} color="#F59E0B" />
                    </View>
                    <Text variant="h1" color={colors.text} style={styles.title}>Go Premium</Text>
                    <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
                        {isPremium ? 'Manage your active subscription' : 'Unlock quizzes, AI chat, and advanced features'}
                    </Text>
                </View>

                {/* Active Plan View */}
                {isPremium && premiumData && (
                    <View style={[styles.activePlanCard, { backgroundColor: colors.surface, borderColor: colors.success }]}>
                        <View style={[styles.activeBadge, { backgroundColor: colors.success }]}>
                            <Text variant="bodySmall" color="#fff" style={{ fontWeight: '700' }}>ACTIVE</Text>
                        </View>
                        <View style={styles.planHeader}>
                            <View>
                                <Text variant="h3" color={colors.text}>{premiumData.planName}</Text>
                                <Text variant="bodySmall" color={colors.textSecondary}>
                                    Expires on: {new Date(premiumData.expiresAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <Ionicons name="sparkles" size={24} color="#F59E0B" />
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: SPACING.md }]} />
                        <View style={styles.featuresList}>
                            {premiumData.features.map((f, i) => (
                                <View key={i} style={styles.featureRow}>
                                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                    <Text variant="bodySmall" color={colors.text} style={{ marginLeft: SPACING.xs, flex: 1 }}>
                                        {f}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* History Button */}
                <TouchableOpacity
                    style={[styles.historyBtn, { borderColor: colors.border }]}
                    onPress={() => router.push('/premium/history')}
                >
                    <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                    <Text variant="bodySmall" color={colors.textSecondary} style={{ marginLeft: SPACING.xs }}>
                        Payment History
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* Plans */}
                <Text variant="h2" color={colors.text} style={styles.sectionTitle}>
                    {isPremium ? 'Upgrade or Renew Plan' : 'Choose a Plan'}
                </Text>

                {plans.length === 0 && (
                    <View style={[styles.emptyPlans, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="information-circle-outline" size={32} color={colors.textSecondary} />
                        <Text variant="body" color={colors.textSecondary} style={{ marginTop: SPACING.sm, textAlign: 'center' }}>
                            No plans available yet.{`\n`}Please check back later or contact admin.
                        </Text>
                        <TouchableOpacity onPress={loadData} style={[styles.retryBtn, { borderColor: colors.primary }]}>
                            <Text variant="bodySmall" color={colors.primary} style={{ fontWeight: '700' }}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {plans.map((plan) => {
                    const isSelected = selectedPlan?._id === plan._id;
                    return (
                        <TouchableOpacity
                            key={plan._id}
                            style={[
                                styles.planCard,
                                { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.border },
                                isSelected && { borderWidth: 2 },
                            ]}
                            onPress={() => setSelectedPlan(plan)}
                            activeOpacity={0.8}
                        >
                            {isSelected && (
                                <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                                    <Text variant="bodySmall" color="#fff" style={{ fontWeight: '700' }}>SELECTED</Text>
                                </View>
                            )}
                            <View style={styles.planHeader}>
                                <View>
                                    <Text variant="h3" color={colors.text}>{plan.planName}</Text>
                                    <Text variant="bodySmall" color={colors.textSecondary}>
                                        {plan.durationDays} days access
                                    </Text>
                                </View>
                                <View style={[styles.priceTag, { backgroundColor: colors.primary + '15' }]}>
                                    <Text variant="h2" color={colors.primary}>{plan.amount}</Text>
                                    <Text variant="bodySmall" color={colors.primary} style={{ marginTop: -4 }}>ETB</Text>
                                </View>
                            </View>
                            {plan.description && (
                                <Text variant="bodySmall" color={colors.textSecondary} style={styles.planDesc}>
                                    {plan.description}
                                </Text>
                            )}
                            <View style={styles.featuresList}>
                                {plan.features.map((f, i) => (
                                    <View key={i} style={styles.featureRow}>
                                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                        <Text variant="bodySmall" color={colors.text} style={{ marginLeft: SPACING.xs, flex: 1 }}>
                                            {f}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {/* Payment Account Info */}
                {account && (
                    <View style={[styles.accountCard, { backgroundColor: colors.warning + '12', borderColor: colors.warning + '40' }]}>
                        <View style={styles.accountHeader}>
                            <Ionicons name="phone-portrait-outline" size={20} color={colors.warning} />
                            <Text variant="h3" color={colors.text} style={{ marginLeft: SPACING.sm }}>
                                Payment Instructions
                            </Text>
                        </View>
                        <Text variant="body" color={colors.textSecondary} style={styles.accountText}>
                            Transfer to:
                        </Text>
                        <View style={[styles.accountDetail, { backgroundColor: colors.surface }]}>
                            <View style={styles.accountRow}>
                                <Text variant="bodySmall" color={colors.textSecondary}>Bank</Text>
                                <Text variant="body" color={colors.text} style={{ fontWeight: '700' }}>{account.bankName}</Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.accountRow}>
                                <Text variant="bodySmall" color={colors.textSecondary}>Account Name</Text>
                                <Text variant="body" color={colors.text} style={{ fontWeight: '700' }}>{account.accountHolderFullName}</Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.accountRow}>
                                <Text variant="bodySmall" color={colors.textSecondary}>Account Number</Text>
                                <Text variant="h3" color={colors.primary} style={{ letterSpacing: 1 }}>{account.accountNumber}</Text>
                            </View>
                        </View>
                        <Text variant="bodySmall" color={colors.textSecondary} style={styles.accountNote}>
                            ⚠️ {account.message}
                        </Text>
                    </View>
                )}

                {/* Upload Section */}
                <View style={styles.uploadSection}>
                    <Text variant="h3" color={colors.text} style={styles.sectionTitle}>
                        Upload Payment Screenshot
                    </Text>
                    {selectedPlan ? (
                        <View style={[styles.selectedPlanChip, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                            <Text variant="bodySmall" color={colors.primary} style={{ marginLeft: 4 }}>
                                {selectedPlan.planName} — {selectedPlan.amount} ETB
                            </Text>
                        </View>
                    ) : (
                        <Text variant="bodySmall" color={colors.error} style={{ marginBottom: SPACING.sm }}>
                            Select a plan above first
                        </Text>
                    )}

                    <View style={styles.inputContainer}>
                        <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: SPACING.xs }}>
                            Your Phone Number (for verification)
                        </Text>
                        <TextInput
                            style={[styles.phoneInput, {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                color: colors.text
                            }]}
                            placeholder="e.g. 0912345678"
                            placeholderTextColor={colors.textSecondary + '80'}
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                    </View>

                    <Button
                        title={uploading ? 'Verifying...' : 'Choose Screenshot & Upload'}
                        onPress={handleUploadScreenshot}
                        loading={uploading}
                        disabled={!selectedPlan || uploading}
                        style={styles.uploadBtn}
                    />
                    <Text variant="bodySmall" color={colors.textSecondary} style={styles.uploadNote}>
                        The system automatically reads your screenshot using AI and verifies the payment.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: SPACING.lg },
    emptyPlans: {
        borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
        marginBottom: SPACING.lg, borderWidth: 1,
        alignItems: 'center',
    },
    retryBtn: {
        marginTop: SPACING.md, paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, borderWidth: 1,
    },
    header: { alignItems: 'center', marginBottom: SPACING.xl },
    crownBadge: {
        width: 64, height: 64, borderRadius: 32,
        justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
    },
    title: { marginBottom: SPACING.xs },
    subtitle: { textAlign: 'center', lineHeight: 22 },
    historyBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1, borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
        marginBottom: SPACING.lg,
    },
    sectionTitle: { marginBottom: SPACING.md },
    activePlanCard: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        borderWidth: 2,
        overflow: 'hidden',
    },
    activeBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderBottomLeftRadius: BORDER_RADIUS.md,
    },
    planCard: {
        borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
        marginBottom: SPACING.md, borderWidth: 1, overflow: 'hidden',
    },
    selectedBadge: {
        position: 'absolute', top: 0, right: 0,
        paddingHorizontal: SPACING.sm, paddingVertical: 4,
        borderBottomLeftRadius: BORDER_RADIUS.sm,
    },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    priceTag: { borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
    planDesc: { marginTop: SPACING.sm, lineHeight: 20 },
    featuresList: { marginTop: SPACING.md },
    featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.xs },
    accountCard: {
        borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
        marginBottom: SPACING.lg, borderWidth: 1,
    },
    accountHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
    accountText: { marginBottom: SPACING.sm },
    accountDetail: { borderRadius: BORDER_RADIUS.md, overflow: 'hidden', marginBottom: SPACING.sm },
    accountRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: SPACING.md,
    },
    divider: { height: 1 },
    accountNote: { lineHeight: 18 },
    uploadSection: { marginTop: SPACING.md },
    selectedPlanChip: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full, alignSelf: 'flex-start',
        marginBottom: SPACING.md,
    },
    uploadBtn: { marginTop: SPACING.sm },
    uploadNote: { marginTop: SPACING.md, textAlign: 'center', lineHeight: 18 },
    inputContainer: {
        marginBottom: SPACING.md,
        width: '100%',
    },
    phoneInput: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: 16,
    },
});

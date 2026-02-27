import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, ScrollView, ActivityIndicator,
    TouchableOpacity, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { chatService, Quiz } from '../../services/chat';
import { useContentProtection } from '../../utils/contentProtection';
import { SPACING, BORDER_RADIUS } from '../../constants/config';

export default function QuizTakingScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Content protection: disable screenshots during quiz
    useContentProtection(true);

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showResult, setShowResult] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => { if (id) loadQuizzes(); }, [id]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const data = await chatService.getChatQuizzes(id!);
            setQuizzes(data);
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Failed to load quiz', text2: error.message });
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const current = quizzes[currentIndex];

    const handleSelectAnswer = (choice: string) => {
        if (submitted) return;
        setSelectedAnswer(choice);
    };

    const handleNext = () => {
        if (!selectedAnswer) {
            Toast.show({ type: 'error', text1: 'Please select an answer' });
            return;
        }
        setAnswers((prev) => ({ ...prev, [current._id]: selectedAnswer }));
        setSubmitted(true);
    };

    const handleContinue = () => {
        if (currentIndex === quizzes.length - 1) {
            setShowResult(true);
        } else {
            setCurrentIndex((i) => i + 1);
            setSelectedAnswer(null);
            setSubmitted(false);
        }
    };

    const score = quizzes.reduce((acc, q) => {
        const userAns = answers[q._id]?.trim().toLowerCase();
        const correct = q.answer?.trim().toLowerCase();
        return acc + (userAns === correct ? 1 : 0);
    }, 0);

    const pct = quizzes.length > 0 ? Math.round((score / quizzes.length) * 100) : 0;
    const scoreColor = pct >= 70 ? colors.success : pct >= 50 ? colors.warning : colors.error;

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text variant="body" color={colors.textSecondary} style={{ marginTop: SPACING.md }}>
                        Loading quiz...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (showResult) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}>
                    {/* Score Header */}
                    <View style={styles.resultHeader}>
                        <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '20', borderColor: scoreColor }]}>
                            <Text style={{ fontSize: 48, fontWeight: '700', color: scoreColor }}>{pct}%</Text>
                            <Text variant="body" color={scoreColor} style={{ fontWeight: '600' }}>
                                {score}/{quizzes.length} correct
                            </Text>
                        </View>
                        <Text variant="h2" color={colors.text} style={{ marginTop: SPACING.md }}>
                            {pct >= 70 ? '🎉 Great Job!' : pct >= 50 ? '👍 Good Effort' : '📚 Keep Studying'}
                        </Text>
                    </View>

                    {/* Review each question */}
                    {quizzes.map((q, i) => {
                        const userAns = answers[q._id];
                        const isCorrect = userAns?.trim().toLowerCase() === q.answer?.trim().toLowerCase();
                        return (
                            <View key={q._id} style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
                                <View style={styles.reviewHeader}>
                                    <View style={[styles.qNum, { backgroundColor: isCorrect ? colors.success + '20' : colors.error + '20' }]}>
                                        <Ionicons name={isCorrect ? 'checkmark' : 'close'} size={16} color={isCorrect ? colors.success : colors.error} />
                                    </View>
                                    <Text variant="body" color={colors.text} style={{ flex: 1, fontWeight: '600' }}>
                                        Q{i + 1}
                                    </Text>
                                </View>
                                <Text variant="body" color={colors.text} style={styles.reviewQuestion}>{q.question}</Text>
                                <View style={styles.reviewAnswers}>
                                    <View style={[styles.answerRow, { backgroundColor: colors.success + '15' }]}>
                                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                        <Text variant="bodySmall" color={colors.success} style={{ marginLeft: 6, flex: 1 }}>
                                            Correct: {(() => {
                                                if (q.choices && !Array.isArray(q.choices) && typeof q.choices === 'object') {
                                                    const key = q.answer?.toLowerCase();
                                                    return (q.choices as any)[key] || q.answer;
                                                }
                                                return q.answer;
                                            })()}
                                        </Text>
                                    </View>
                                    {!isCorrect && (
                                        <View style={[styles.answerRow, { backgroundColor: colors.error + '15' }]}>
                                            <Ionicons name="close-circle" size={16} color={colors.error} />
                                            <Text variant="bodySmall" color={colors.error} style={{ marginLeft: 6, flex: 1 }}>
                                                Your answer: {userAns || '(not answered)'}
                                            </Text>
                                        </View>
                                    )}
                                    {q.explanation && (
                                        <Text variant="bodySmall" color={colors.textSecondary} style={{ marginTop: SPACING.xs, lineHeight: 18 }}>
                                            💡 {q.explanation}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}

                    <Button title="Back to Quizzes" onPress={() => router.back()} style={{ marginTop: SPACING.md }} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (!current) return null;

    // Handle choices that might be an object {a: "...", b: "..."} or an array
    const choicesList = Array.isArray(current.choices)
        ? current.choices
        : Object.values(current.choices || {}).filter(c => c !== null);

    // Handle answer that might be a key (a, b, c, d) or an actual choice text
    const getAnswerText = () => {
        if (!current.answer) return '';
        // If it's a key and choices is an object
        if (!Array.isArray(current.choices) && typeof current.choices === 'object') {
            const key = current.answer.toLowerCase();
            if (current.choices[key]) return current.choices[key];
        }
        return current.answer;
    };

    const correctAnswerText = getAnswerText();
    const isCorrect = submitted && selectedAnswer?.trim().toLowerCase() === correctAnswerText?.trim().toLowerCase();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Progress Bar */}
            <View style={styles.progressHeader}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${((currentIndex + 1) / quizzes.length) * 100}%` }]} />
                </View>
                <Text variant="bodySmall" color={colors.textSecondary} style={{ minWidth: 40, textAlign: 'right' }}>
                    {currentIndex + 1}/{quizzes.length}
                </Text>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
                {/* Question */}
                <View style={[styles.questionCard, { backgroundColor: colors.surface }]}>
                    <Text variant="bodySmall" color={colors.primary} style={{ fontWeight: '700', marginBottom: SPACING.sm }}>
                        QUESTION {currentIndex + 1}
                    </Text>
                    <Text variant="h3" color={colors.text} style={{ lineHeight: 28 }}>{current.question}</Text>
                </View>

                {/* Choices */}
                {choicesList.map((choice: any, i) => {
                    const choiceStr = String(choice || '');
                    const isSelected = selectedAnswer === choiceStr;
                    const choiceIsCorrect = submitted && choiceStr.trim().toLowerCase() === correctAnswerText?.trim().toLowerCase();
                    const choiceIsWrong = submitted && isSelected && !choiceIsCorrect;

                    let bg = colors.surface;
                    let border = colors.border;
                    if (choiceIsCorrect) { bg = colors.success + '20'; border = colors.success; }
                    else if (choiceIsWrong) { bg = colors.error + '20'; border = colors.error; }
                    else if (isSelected && !submitted) { bg = colors.primary + '15'; border = colors.primary; }

                    if (!choiceStr) return null;

                    return (
                        <TouchableOpacity
                            key={i}
                            style={[styles.choiceCard, { backgroundColor: bg, borderColor: border }]}
                            onPress={() => handleSelectAnswer(choiceStr)}
                            activeOpacity={submitted ? 1 : 0.7}
                        >
                            <View style={[styles.choiceLetter, { backgroundColor: border + '30' }]}>
                                <Text variant="bodySmall" style={{ color: border, fontWeight: '700' }}>
                                    {String.fromCharCode(65 + i)}
                                </Text>
                            </View>
                            <Text variant="body" color={colors.text} style={{ flex: 1 }}>{choiceStr}</Text>
                            {choiceIsCorrect && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
                            {choiceIsWrong && <Ionicons name="close-circle" size={20} color={colors.error} />}
                        </TouchableOpacity>
                    );
                })}

                {/* Explanation after submit */}
                {submitted && current.explanation && (
                    <View style={[styles.explanationCard, { backgroundColor: colors.primary + '12' }]}>
                        <Ionicons name="bulb" size={16} color={colors.primary} />
                        <Text variant="bodySmall" color={colors.primary} style={{ flex: 1, marginLeft: SPACING.xs, lineHeight: 20 }}>
                            {current.explanation}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Action */}
            <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + SPACING.md }]}>
                {!submitted ? (
                    <Button title="Check Answer" onPress={handleNext} disabled={!selectedAnswer} />
                ) : (
                    <Button
                        title={currentIndex === quizzes.length - 1 ? 'See Results' : 'Next Question'}
                        onPress={handleContinue}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    progressHeader: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    content: { padding: SPACING.lg },
    questionCard: {
        borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
        marginBottom: SPACING.lg, shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
    },
    choiceCard: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
        marginBottom: SPACING.sm, borderWidth: 1.5,
    },
    choiceLetter: {
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
    },
    explanationCard: {
        flexDirection: 'row', alignItems: 'flex-start',
        borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginTop: SPACING.sm,
    },
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: 1,
    },
    // Results
    resultHeader: { alignItems: 'center', marginBottom: SPACING.xl },
    scoreBadge: {
        width: 160, height: 160, borderRadius: 80, borderWidth: 4,
        justifyContent: 'center', alignItems: 'center',
    },
    reviewCard: {
        borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md,
    },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    qNum: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
    reviewQuestion: { marginBottom: SPACING.sm, lineHeight: 24 },
    reviewAnswers: { gap: SPACING.xs },
    answerRow: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm },
});

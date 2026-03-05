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
import { chatService, Quiz, Reference } from '../../services/chat';
import { useContentProtection } from '../../utils/contentProtection';
import { SPACING, BORDER_RADIUS } from '../../constants/config';
import ReferenceList from '../../components/ReferenceList';

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

            // Fetch references for each question
            const quizzesWithRefs = await Promise.all(data.map(async (q) => {
                try {
                    const rawRefs = await chatService.getQuizReferences(q._id);

                    // Populate book details for each reference
                    const populatedRefs = await Promise.all(rawRefs.map(async (ref) => {
                        const bid = typeof ref.bookId === 'string' ? ref.bookId : (ref.bookId as any)?._id;
                        if (bid) {
                            try {
                                const book = await chatService.getBookById(bid);
                                return { ...ref, bookId: book };
                            } catch (e) {
                                console.error('Failed to fetch book:', bid, e);
                            }
                        }
                        return ref;
                    }));

                    return { ...q, references: populatedRefs };
                } catch (err) {
                    console.error('Failed to load refs for quiz:', q._id, err);
                    return { ...q, references: [] };
                }
            }));

            setQuizzes(quizzesWithRefs);

            // Pre-fill existing attempts if any
            const existingAnswers: Record<string, string> = {};
            quizzesWithRefs.forEach(q => {
                if (q.studentAttempt) {
                    existingAnswers[q._id] = q.studentAttempt;
                }
            });
            setAnswers(existingAnswers);

        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Failed to load quiz', text2: error.message });
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const current = quizzes[currentIndex];

    useEffect(() => {
        const q = quizzes[currentIndex];
        if (q && answers[q._id]) {
            setSelectedAnswer(answers[q._id]);
            setSubmitted(true);
        } else {
            setSelectedAnswer(null);
            setSubmitted(false);
        }
    }, [currentIndex, quizzes, answers]);

    const handleSelectAnswer = (choiceKey: string) => {
        if (submitted) return;
        setSelectedAnswer(choiceKey);
    };

    const handleNext = async () => {
        if (!selectedAnswer || !current) return;

        try {
            // Track attempt in backend
            await chatService.submitQuizAttempt(current._id, selectedAnswer);

            // Store locally - this will trigger useEffect to setSubmitted(true)
            setAnswers((prev) => ({ ...prev, [current._id]: selectedAnswer }));
        } catch (error) {
            console.error('Failed to submit attempt:', error);
            // Fallback: update locally anyway
            setAnswers((prev) => ({ ...prev, [current._id]: selectedAnswer }));
        }
    };

    const handleContinue = () => {
        if (currentIndex === quizzes.length - 1) {
            setShowResult(true);
        } else {
            setCurrentIndex((i) => i + 1);
        }
    };

    const score = quizzes.reduce((acc, q) => {
        const userAnsKey = answers[q._id]?.trim().toLowerCase();
        const correctKey = q.answer?.trim().toLowerCase();
        return acc + (userAnsKey === correctKey ? 1 : 0);
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
                        const userAnsKey = answers[q._id];
                        const correctKey = q.answer?.trim().toLowerCase();
                        const isCorrect = userAnsKey?.trim().toLowerCase() === correctKey;
                        const choices = q.choices as any;

                        const getChoiceText = (key: string) => {
                            if (!choices) return key;
                            if (Array.isArray(choices)) {
                                const idx = key.charCodeAt(0) - 97; // a -> 0
                                return choices[idx] || key;
                            }
                            return choices[key] || key;
                        };

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
                                            Correct: ({correctKey.toUpperCase()}) {getChoiceText(correctKey)}
                                        </Text>
                                    </View>
                                    {!isCorrect && (
                                        <View style={[styles.answerRow, { backgroundColor: colors.error + '15' }]}>
                                            <Ionicons name="close-circle" size={16} color={colors.error} />
                                            <Text variant="bodySmall" color={colors.error} style={{ marginLeft: 6, flex: 1 }}>
                                                Your answer: {userAnsKey ? `(${userAnsKey.toUpperCase()}) ${getChoiceText(userAnsKey)}` : '(not answered)'}
                                            </Text>
                                        </View>
                                    )}
                                    {q.explanation && (
                                        <Text variant="bodySmall" color={colors.textSecondary} style={{ marginTop: SPACING.xs, lineHeight: 18 }}>
                                            💡 {q.explanation}
                                        </Text>
                                    )}
                                    {q.references && q.references.length > 0 && (
                                        <ReferenceList references={q.references} />
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

    // Convert choices to standardized list of { key: 'a', text: 'Some text' }
    const choicesList: { key: string, text: string }[] = [];
    if (current.choices) {
        if (Array.isArray(current.choices)) {
            current.choices.forEach((text, i) => {
                choicesList.push({ key: String.fromCharCode(97 + i), text });
            });
        } else {
            Object.entries(current.choices).forEach(([key, text]) => {
                if (text) choicesList.push({ key, text });
            });
        }
    }

    const correctKey = current.answer?.trim().toLowerCase();
    const isCorrectChoice = (key: string) => submitted && key.toLowerCase() === correctKey;

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
                {choicesList.map((item, i) => {
                    const isSelected = selectedAnswer === item.key;
                    const correct = isCorrectChoice(item.key);
                    const wrong = submitted && isSelected && !correct;

                    let bg = colors.surface;
                    let border = colors.border;
                    if (correct) { bg = colors.success + '20'; border = colors.success; }
                    else if (wrong) { bg = colors.error + '20'; border = colors.error; }
                    else if (isSelected && !submitted) { bg = colors.primary + '15'; border = colors.primary; }

                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={[styles.choiceCard, { backgroundColor: bg, borderColor: border }]}
                            onPress={() => handleSelectAnswer(item.key)}
                            activeOpacity={submitted ? 1 : 0.7}
                        >
                            <View style={[styles.choiceLetter, { backgroundColor: border + '30' }]}>
                                <Text variant="bodySmall" style={{ color: border, fontWeight: '700' }}>
                                    {item.key.toUpperCase()}
                                </Text>
                            </View>
                            <Text variant="body" color={colors.text} style={{ flex: 1 }}>{item.text}</Text>
                            {correct && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
                            {wrong && <Ionicons name="close-circle" size={20} color={colors.error} />}
                        </TouchableOpacity>
                    );
                })}

                {/* Clarification after submit */}
                {submitted && (current.explanation || (current.references && current.references.length > 0)) && (
                    <View style={[styles.explanationCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                        <View style={{ flex: 1 }}>
                            {current.explanation && (
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: current.references?.length ? SPACING.md : 0 }}>
                                    <View style={[styles.aiAvatar, { backgroundColor: colors.accent + '20', marginRight: SPACING.sm }]}>
                                        <Ionicons name="bulb" size={16} color={colors.accent} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text variant="h3" color={colors.text} style={{ marginBottom: 4 }}>AI Clarification</Text>
                                        <Text variant="bodySmall" color={colors.textSecondary} style={{ lineHeight: 20 }}>
                                            {current.explanation}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {current.references && current.references.length > 0 && (
                                <View style={{ borderTopWidth: current.explanation ? 1 : 0, borderTopColor: colors.border, paddingTop: current.explanation ? SPACING.xs : 0 }}>
                                    <ReferenceList references={current.references} />
                                </View>
                            )}
                        </View>
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
        borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginTop: SPACING.md,
    },
    aiAvatar: {
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
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

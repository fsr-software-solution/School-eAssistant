import React from 'react';
import { View, Text as RNText, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FontSizeType } from '../context/ThemeContext';
import { SPACING } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
    const { theme, setTheme, colors, isDark, fontSize, setFontSize, typography } = useTheme();

    const toggleTheme = (value: boolean) => {
        setTheme(value ? 'dark' : 'light');
    };

    const FontSizeOption = ({ size, label }: { size: FontSizeType, label: string }) => {
        const isSelected = fontSize === size;
        return (
            <TouchableOpacity
                style={[
                    styles.fontSizeOption,
                    { borderColor: isSelected ? colors.primary : colors.border },
                    isSelected && { backgroundColor: `${colors.primary}20` }
                ]}
                onPress={() => setFontSize(size)}
            >
                <RNText style={[
                    typography.body,
                    { color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '600' : '400' }
                ]}>
                    {label}
                </RNText>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
                    <View style={styles.settingLabelContainer}>
                        <Ionicons name="moon-outline" size={24} color={colors.text} style={styles.icon} />
                        <View>
                            <RNText style={[typography.body, { color: colors.text, fontWeight: '600' }]}>Dark Mode</RNText>
                            <RNText style={[typography.caption, { color: colors.textSecondary }]}>
                                Toggle dark theme
                            </RNText>
                        </View>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={'#fff'}
                    />
                </View>

                <View style={[styles.settingItem, styles.settingItemVertical, { borderBottomColor: colors.border }]}>
                    <View style={styles.settingLabelContainer}>
                        <Ionicons name="text-outline" size={24} color={colors.text} style={styles.icon} />
                        <View>
                            <RNText style={[typography.body, { color: colors.text, fontWeight: '600' }]}>Font Size</RNText>
                            <RNText style={[typography.caption, { color: colors.textSecondary }]}>
                                Adjust text size across the app
                            </RNText>
                        </View>
                    </View>

                    <View style={styles.fontSizeOptionsContainer}>
                        <FontSizeOption size="small" label="Small" />
                        <FontSizeOption size="medium" label="Medium" />
                        <FontSizeOption size="large" label="Large" />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.md,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    settingLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: SPACING.md,
    },
    settingItemVertical: {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: SPACING.md,
    },
    fontSizeOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: SPACING.xl + SPACING.md, // Align with text
    },
    fontSizeOption: {
        flex: 1,
        marginHorizontal: SPACING.xs,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
    },
});

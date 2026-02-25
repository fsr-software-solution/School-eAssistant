import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, getTypography } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';
export type FontSizeType = 'small' | 'medium' | 'large';

interface ThemeContextType {
    theme: ThemeType;
    colors: typeof lightColors;
    isDark: boolean;
    setTheme: (theme: ThemeType) => void;
    fontSize: FontSizeType;
    setFontSize: (size: FontSizeType) => void;
    typography: ReturnType<typeof getTypography>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_preference';
const FONT_SIZE_STORAGE_KEY = 'app_font_size_preference';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<ThemeType>('system');
    const [fontSize, setFontSizeState] = useState<FontSizeType>('medium');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Load saved theme preference
        const loadSettings = async () => {
            try {
                const [savedTheme, savedFontSize] = await Promise.all([
                    AsyncStorage.getItem(THEME_STORAGE_KEY),
                    AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY)
                ]);

                if (savedTheme === 'light' || savedTheme === 'dark') {
                    setThemeState(savedTheme as ThemeType);
                }
                if (savedFontSize === 'small' || savedFontSize === 'medium' || savedFontSize === 'large') {
                    setFontSizeState(savedFontSize as FontSizeType);
                }
            } catch (error) {
                console.error('Failed to load settings', error);
            } finally {
                setIsReady(true);
            }
        };
        loadSettings();
    }, []);

    const setTheme = async (newTheme: ThemeType) => {
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch (error) {
            console.error('Failed to save theme preference', error);
        }
    };

    const isDark = theme === 'system'
        ? systemColorScheme === 'dark'
        : theme === 'dark';

    const colors = isDark ? darkColors : lightColors;

    const fontScale = fontSize === 'small' ? 0.85 : fontSize === 'large' ? 1.15 : 1;
    const typography = getTypography(fontScale);

    if (!isReady) return null; // Avoid rendering flash before theme loads

    const updateFontSize = async (newSize: FontSizeType) => {
        setFontSizeState(newSize);
        try {
            await AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, newSize);
        } catch (error) {
            console.error('Failed to save font size preference', error);
        }
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            colors,
            isDark,
            setTheme,
            fontSize,
            setFontSize: updateFontSize,
            typography
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

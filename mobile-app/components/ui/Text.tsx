import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface AppTextProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption';
    color?: string;
    children: React.ReactNode;
}

export default function Text({ variant = 'body', color, style, children, ...props }: AppTextProps) {
    const { typography, colors } = useTheme();

    return (
        <RNText
            style={[
                typography[variant],
                { color: color || colors.text },
                style,
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
}

import { createContext, useLayoutEffect, useState } from 'react';
import type { ReactNode } from 'react';

import {
    defaultThemePreset,
    getReadableForeground,
    getThemeColors,
} from '@/lib/themes';
import type {
    ThemeColors,
    ThemeMode,
    ThemePreferences,
    ThemePreset,
} from '@/types/theme';

interface ThemeContextValue {
    mode: ThemeMode;
    preset: ThemePreset;
    customColors?: ThemeColors;

    setMode: (mode: ThemeMode) => void;
    setPreset: (preset: ThemePreset) => void;
    setCustomColors: (colors: ThemeColors) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
    undefined,
);

interface ThemeProviderProps {
    children: ReactNode;
    preferences?: ThemePreferences;
}

export default function ThemeProvider({
    children,
    preferences,
}: ThemeProviderProps) {
    const [mode, setMode] = useState<ThemeMode>(preferences?.mode ?? 'system');
    const [preset, setPreset] = useState<ThemePreset>(
        preferences?.preset ?? defaultThemePreset,
    );
    const [customColors, setCustomColors] = useState<ThemeColors | undefined>(
        preferences?.customColors,
    );

    const applyMode = (selectedMode: ThemeMode) => {
        const root = document.documentElement;

        let resolvedMode = selectedMode;

        if (selectedMode === 'system') {
            resolvedMode = window.matchMedia('(prefers-color-scheme: dark)')
                .matches
                ? 'dark'
                : 'light';
        }

        root.classList.toggle('dark', resolvedMode === 'dark');
        root.style.colorScheme = resolvedMode;
    };

    useLayoutEffect(() => {
        const root = document.documentElement;

        const colors = getThemeColors(preset, customColors);

        root.style.setProperty('--primary', colors.primary);
        root.style.setProperty('--secondary', colors.secondary);
        root.style.setProperty('--accent', colors.accent);
        root.style.setProperty(
            '--primary-foreground',
            getReadableForeground(colors.primary),
        );
    }, [preset, customColors]);

    useLayoutEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateTheme = () => {
            applyMode(mode);
        };

        updateTheme();

        if (mode === 'system') {
            mediaQuery.addEventListener('change', updateTheme);

            return () => {
                mediaQuery.removeEventListener('change', updateTheme);
            };
        }
    }, [mode]);

    return (
        <ThemeContext.Provider
            value={{
                mode,
                preset,
                customColors,
                setMode,
                setPreset,
                setCustomColors,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

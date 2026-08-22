import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { getThemeColors } from '@/lib/themes';
import type { ThemeMode, ThemePreferences, ThemePreset } from '@/types/theme';

interface ThemeContextValue {
    mode: ThemeMode;
    preset: ThemePreset;

    setMode: (mode: ThemeMode) => void;
    setPreset: (preset: ThemePreset) => void;
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
        preferences?.preset ?? 'ocean',
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
    };

    useEffect(() => {
        const root = document.documentElement;

        const colors = getThemeColors(preset, preferences?.customColors);

        root.style.setProperty('--primary', colors.primary);

        root.style.setProperty('--secondary', colors.secondary);

        root.style.setProperty('--accent', colors.accent);
    }, [preset, preferences?.customColors]);

    useEffect(() => {
    const mediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)',
    );

    const updateTheme = () => {
        applyMode(mode);
    };

    updateTheme();

    if (mode === 'system') {
        mediaQuery.addEventListener(
            'change',
            updateTheme,
        );

        return () => {
            mediaQuery.removeEventListener(
                'change',
                updateTheme,
            );
        };
    }
}, [mode]);

    return (
        <ThemeContext.Provider
            value={{
                mode,
                preset,
                setMode,
                setPreset,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

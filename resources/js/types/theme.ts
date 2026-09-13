export type ThemeMode = 'system' | 'light' | 'dark';

export type ThemePreset = 'ocean' | 'forest' | 'violet' | 'custom';

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
}

export interface ThemePreferences {
    mode: ThemeMode;
    preset: ThemePreset;
    customColors?: ThemeColors;
}

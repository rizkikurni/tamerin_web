import type { ThemeColors, ThemePreset } from '@/types/theme';

export const themePresets: Record<
    Exclude<ThemePreset, 'custom'>,
    ThemeColors
> = {
    ocean: {
        primary: '#5B7CFA',
        secondary: '#79B8F3',
        accent: '#62C6C1',
    },

    forest: {
        primary: '#4F8A6D',
        secondary: '#79A987',
        accent: '#B2C98B',
    },

    violet: {
        primary: '#806CEB',
        secondary: '#A58AF4',
        accent: '#D38CF0',
    },
};

export const defaultThemePreset: Exclude<ThemePreset, 'custom'> = 'violet';
export const defaultThemeColors = themePresets[defaultThemePreset];

export function getThemeColors(
    preset: ThemePreset,
    customColors?: ThemeColors,
): ThemeColors {
    if (preset === 'custom') {
        return customColors ?? defaultThemeColors;
    }

    return themePresets[preset];
}

export function getReadableForeground(background: string): string {
    const normalizedHex = background.replace('#', '');

    if (!/^[\da-f]{6}$/i.test(normalizedHex)) {
        return '#ffffff';
    }

    const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
    const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
    const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);
    const perceivedBrightness = (red * 299 + green * 587 + blue * 114) / 1000;

    return perceivedBrightness >= 155 ? '#111416' : '#ffffff';
}

import type {
    ThemeColors,
    ThemePreset,
} from '@/types/theme';

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

export function getThemeColors(
    preset: ThemePreset,
    customColors?: ThemeColors,
): ThemeColors {
    if (preset === 'custom') {
        return customColors ?? themePresets.ocean;
    }

    return themePresets[preset];
}

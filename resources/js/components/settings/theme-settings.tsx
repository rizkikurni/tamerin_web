import { useState } from 'react';

import { router } from '@inertiajs/react';
import { Check, Monitor, Moon, RotateCcw, Save, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Progress from '@/components/ui/progress';
import { useTheme } from '@/hooks/use-theme';
import { themePresets } from '@/lib/themes';
import { cn } from '@/lib/utils';
import type { ThemeMode, ThemePreset } from '@/types/theme';

// --- Mode Options ---

interface ModeOption {
    value: ThemeMode;
    label: string;
    description: string;
    icon: LucideIcon;
}

const modeOptions: ModeOption[] = [
    {
        value: 'system',
        label: 'Sistem',
        description: 'Mengikuti pengaturan perangkat',
        icon: Monitor,
    },
    {
        value: 'light',
        label: 'Terang',
        description: 'Tampilan terang',
        icon: Sun,
    },
    {
        value: 'dark',
        label: 'Gelap',
        description: 'Tampilan gelap',
        icon: Moon,
    },
];

// --- Preset Options ---

interface PresetOption {
    value: ThemePreset;
    label: string;
    colors: { primary: string; secondary: string; accent: string };
}

const presetOptions: PresetOption[] = [
    {
        value: 'ocean',
        label: 'Ocean',
        colors: themePresets.ocean,
    },
    {
        value: 'forest',
        label: 'Forest',
        colors: themePresets.forest,
    },
    {
        value: 'violet',
        label: 'Violet',
        colors: themePresets.violet,
    },
    {
        value: 'custom',
        label: 'Custom',
        colors: { primary: '#888888', secondary: '#aaaaaa', accent: '#cccccc' },
    },
];

// --- Color Input ---

interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-secondary">
                {label}
            </label>
            <div className="flex items-center gap-2.5">
                <div className="relative">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 cursor-pointer opacity-0"
                    />
                    <div
                        className="h-9 w-9 rounded-xl border border-border shadow-sm"
                        style={{ backgroundColor: value }}
                    />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    maxLength={7}
                    className={cn(
                        'h-9 flex-1 rounded-xl border border-border bg-surface px-3',
                        'text-sm text-foreground',
                        'transition-colors outline-none',
                        'focus:border-primary focus:ring-2 focus:ring-primary/20',
                    )}
                />
            </div>
        </div>
    );
}

// --- Live Preview ---

function LivePreview() {
    return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Preview</p>

            <div className="rounded-2xl border border-border bg-background p-4">
                {/* Mini dashboard preview */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                            Dashboard
                        </span>
                        <Button size="sm">Tombol Primary</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Card>
                            <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">
                                    Total Saldo
                                </p>
                                <p className="mt-1 text-sm font-medium text-foreground">
                                    Rp12.500.000
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">
                                    Pemasukan
                                </p>
                                <p className="mt-1 text-sm font-medium text-success">
                                    Rp5.000.000
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge>Default</Badge>
                        <Badge variant="success">Aman</Badge>
                        <Badge variant="warning">Peringatan</Badge>
                        <Badge variant="danger">Bahaya</Badge>
                    </div>

                    <Progress value={65} showValue />

                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary">
                            Secondary
                        </Button>
                        <Button size="sm" variant="outline">
                            Outline
                        </Button>
                        <Button size="sm" variant="ghost">
                            Ghost
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Main Component ---

export default function ThemeSettings() {
    const { mode, preset, setMode, setPreset, customColors, setCustomColors } =
        useTheme();

    const [customPrimary, setCustomPrimary] = useState(
        customColors?.primary ?? '#5B7CFA',
    );
    const [customSecondary, setCustomSecondary] = useState(
        customColors?.secondary ?? '#79B8F3',
    );
    const [customAccent, setCustomAccent] = useState(
        customColors?.accent ?? '#62C6C1',
    );

    const [saving, setSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState<string | null>(null);

    // Apply custom colors live
    function applyCustomColors(
        primary: string,
        secondary: string,
        accent: string,
    ) {
        setCustomColors({ primary, secondary, accent });
    }

    function handleCustomPrimary(value: string) {
        setCustomPrimary(value);
        if (preset === 'custom') {
            applyCustomColors(value, customSecondary, customAccent);
        }
    }

    function handleCustomSecondary(value: string) {
        setCustomSecondary(value);
        if (preset === 'custom') {
            applyCustomColors(customPrimary, value, customAccent);
        }
    }

    function handleCustomAccent(value: string) {
        setCustomAccent(value);
        if (preset === 'custom') {
            applyCustomColors(customPrimary, customSecondary, value);
        }
    }

    function handlePresetChange(newPreset: ThemePreset) {
        setPreset(newPreset);
        if (newPreset === 'custom') {
            applyCustomColors(customPrimary, customSecondary, customAccent);
        }
    }

    function handleReset() {
        setMode('system');
        setPreset('ocean');
        setCustomPrimary('#5B7CFA');
        setCustomSecondary('#79B8F3');
        setCustomAccent('#62C6C1');
    }

    function handleSaveToDatabase() {
        setSaving(true);
        setSavedMessage(null);

        router.patch(
            '/settings/preferences',
            {
                theme_mode: mode,
                theme_preset: preset,
                primary_hex: preset === 'custom' ? customPrimary : null,
                secondary_hex: preset === 'custom' ? customSecondary : null,
                accent_hex: preset === 'custom' ? customAccent : null,
                timezone: 'Asia/Jakarta',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSaving(false);
                    setSavedMessage(
                        'Preferensi tema berhasil disimpan ke database!',
                    );
                    setTimeout(() => setSavedMessage(null), 4000);
                },
                onError: () => {
                    setSaving(false);
                },
            },
        );
    }

    return (
        <div className="space-y-6">
            {/* Mode Selector */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                    Mode Tampilan
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {modeOptions.map((option) => {
                        const Icon = option.icon;
                        const isActive = mode === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setMode(option.value)}
                                className={cn(
                                    'relative flex items-center gap-3 rounded-2xl border p-4',
                                    'text-left transition-all duration-200',
                                    isActive
                                        ? 'border-primary bg-primary-soft'
                                        : 'border-border bg-surface hover:border-border-strong hover:bg-surface-muted',
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex h-10 w-10 items-center justify-center rounded-xl',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-surface-muted text-muted-foreground',
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div>
                                    <p
                                        className={cn(
                                            'text-sm font-medium',
                                            isActive
                                                ? 'text-primary'
                                                : 'text-foreground',
                                        )}
                                    >
                                        {option.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {option.description}
                                    </p>
                                </div>

                                {isActive && (
                                    <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Preset Selector */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                    Tema Warna
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {presetOptions.map((option) => {
                        const isActive = preset === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handlePresetChange(option.value)}
                                className={cn(
                                    'relative flex flex-col items-center gap-2.5 rounded-2xl border p-4',
                                    'transition-all duration-200',
                                    isActive
                                        ? 'border-primary bg-primary-soft'
                                        : 'border-border bg-surface hover:border-border-strong hover:bg-surface-muted',
                                )}
                            >
                                {/* Color dots */}
                                <div className="flex gap-1.5">
                                    <div
                                        className="h-5 w-5 rounded-full shadow-sm"
                                        style={{
                                            backgroundColor:
                                                option.colors.primary,
                                        }}
                                    />
                                    <div
                                        className="h-5 w-5 rounded-full shadow-sm"
                                        style={{
                                            backgroundColor:
                                                option.colors.secondary,
                                        }}
                                    />
                                    <div
                                        className="h-5 w-5 rounded-full shadow-sm"
                                        style={{
                                            backgroundColor:
                                                option.colors.accent,
                                        }}
                                    />
                                </div>

                                <span
                                    className={cn(
                                        'text-xs font-medium',
                                        isActive
                                            ? 'text-primary'
                                            : 'text-foreground',
                                    )}
                                >
                                    {option.label}
                                </span>

                                {isActive && (
                                    <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Custom Colors — only shown when custom preset selected */}
            {preset === 'custom' && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground">
                        Warna Kustom
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Hanya warna primary, secondary, dan accent yang dapat
                        diubah.
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <ColorInput
                            label="Primary"
                            value={customPrimary}
                            onChange={handleCustomPrimary}
                        />
                        <ColorInput
                            label="Secondary"
                            value={customSecondary}
                            onChange={handleCustomSecondary}
                        />
                        <ColorInput
                            label="Accent"
                            value={customAccent}
                            onChange={handleCustomAccent}
                        />
                    </div>
                </div>
            )}

            {/* Live Preview */}
            <LivePreview />

            {/* Actions: Save & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                    Reset ke default
                </Button>

                <Button
                    size="sm"
                    loading={saving}
                    onClick={handleSaveToDatabase}
                >
                    <Save className="h-4 w-4" />
                    Simpan ke Database
                </Button>
            </div>

            {savedMessage && (
                <p className="mt-2 text-center text-xs font-medium text-success">
                    {savedMessage}
                </p>
            )}
        </div>
    );
}

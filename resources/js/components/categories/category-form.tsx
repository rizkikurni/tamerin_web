import { Form } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    BriefcaseBusiness,
    Car,
    Check,
    CircleDollarSign,
    Gift,
    GraduationCap,
    HeartPulse,
    House,
    Save,
    ShoppingCart,
    Tags,
    Utensils,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

import { TextField } from '@/components/form-controls';
import Badge from '@/components/ui/badge';
import Button, { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Category, CategoryFormData, SelectOption } from '@/types';

type CategoryFormProps = {
    form: { action: string; method: 'post' };
    categoryTypes: SelectOption[];
    colorOptions: SelectOption[];
    iconOptions: SelectOption[];
    cancelUrl: string;
    category?: CategoryFormData;
    submitLabel: string;
};

type CategoryType = Category['type'];

const categoryIcons: Record<string, LucideIcon> = {
    wallet: Wallet,
    'shopping-cart': ShoppingCart,
    utensils: Utensils,
    car: Car,
    'briefcase-business': BriefcaseBusiness,
    house: House,
    'heart-pulse': HeartPulse,
    'graduation-cap': GraduationCap,
    gift: Gift,
    'circle-dollar-sign': CircleDollarSign,
};

const colorStyles: Record<
    string,
    {
        badgeClass: string;
        swatchClass: string;
    }
> = {
    blue: {
        badgeClass: 'bg-primary-soft text-primary',
        swatchClass: 'bg-primary',
    },
    green: {
        badgeClass: 'bg-success/10 text-success',
        swatchClass: 'bg-success',
    },
    violet: {
        badgeClass: 'bg-secondary-soft text-secondary',
        swatchClass: 'bg-secondary',
    },
    amber: {
        badgeClass: 'bg-warning/10 text-warning',
        swatchClass: 'bg-warning',
    },
    rose: {
        badgeClass: 'bg-danger/10 text-danger',
        swatchClass: 'bg-danger',
    },
};

type CategoryPreset = {
    name: string;
    color_token: string;
    icon: string;
};

const categoryPresets: Record<CategoryType, CategoryPreset[]> = {
    expense: [
        {
            name: 'Langganan & Digital',
            color_token: 'violet',
            icon: 'wallet',
        },
        {
            name: 'Kesehatan',
            color_token: 'rose',
            icon: 'heart-pulse',
        },
        {
            name: 'Pendidikan',
            color_token: 'green',
            icon: 'graduation-cap',
        },
        {
            name: 'Hiburan & Hobi',
            color_token: 'amber',
            icon: 'gift',
        },
        {
            name: 'Makanan & Minuman',
            color_token: 'amber',
            icon: 'utensils',
        },
        {
            name: 'Transportasi',
            color_token: 'blue',
            icon: 'car',
        },
        {
            name: 'Belanja',
            color_token: 'violet',
            icon: 'shopping-cart',
        },
        {
            name: 'Tagihan & Rumah',
            color_token: 'rose',
            icon: 'house',
        },
    ],
    income: [
        {
            name: 'Gaji',
            color_token: 'green',
            icon: 'briefcase-business',
        },
        {
            name: 'Bonus & THR',
            color_token: 'amber',
            icon: 'gift',
        },
        {
            name: 'Freelance & Proyek',
            color_token: 'violet',
            icon: 'wallet',
        },
        {
            name: 'Hasil Investasi',
            color_token: 'blue',
            icon: 'circle-dollar-sign',
        },
        {
            name: 'Hadiah',
            color_token: 'rose',
            icon: 'gift',
        },
        {
            name: 'Pemasukan Lainnya',
            color_token: 'blue',
            icon: 'circle-dollar-sign',
        },
    ],
};

export default function CategoryForm({
    form,
    categoryTypes,
    colorOptions,
    iconOptions,
    cancelUrl,
    category,
    submitLabel,
}: CategoryFormProps) {
    const [selectedType, setSelectedType] = useState<CategoryType>(
        () => category?.type ?? 'expense',
    );
    const [name, setName] = useState<string>(() => category?.name ?? '');
    const [selectedColor, setSelectedColor] = useState<string>(
        () => category?.color_token ?? 'blue',
    );
    const [selectedIcon, setSelectedIcon] = useState<string>(
        () => category?.icon ?? 'wallet',
    );

    const PreviewIcon = categoryIcons[selectedIcon] ?? Tags;
    const previewColorClass =
        colorStyles[selectedColor]?.badgeClass ??
        'bg-surface-muted text-muted-foreground';

    const applyPreset = (preset: CategoryPreset) => {
        setName(preset.name);
        setSelectedColor(preset.color_token);
        setSelectedIcon(preset.icon);
    };

    const orderedTypes = [...categoryTypes].sort((first, second) =>
        first.value === 'expense' ? -1 : second.value === 'expense' ? 1 : 0,
    );

    return (
        <Form {...form} className="grid gap-5">
            {({ errors, processing }) => (
                <>
                    <input type="hidden" name="type" value={selectedType} />
                    <input
                        type="hidden"
                        name="color_token"
                        value={selectedColor}
                    />
                    <input type="hidden" name="icon" value={selectedIcon} />

                    {/* 1. Segmented Control Tipe Kategori */}
                    <div className="grid gap-2">
                        <span className="text-xs font-medium text-foreground-secondary">
                            Tipe kategori
                        </span>
                        <div
                            role="radiogroup"
                            aria-label="Tipe kategori"
                            className="grid grid-cols-2 gap-2 rounded-2xl border border-[var(--control-border)] bg-background/60 p-1.5"
                        >
                            {orderedTypes.map((typeOption) => {
                                const value = typeOption.value as CategoryType;
                                const active = selectedType === value;
                                const isExpense = value === 'expense';
                                const Icon = isExpense
                                    ? ArrowUpRight
                                    : ArrowDownLeft;

                                return (
                                    <button
                                        key={typeOption.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() => setSelectedType(value)}
                                        className={cn(
                                            'flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-150 sm:text-sm',
                                            active
                                                ? isExpense
                                                    ? 'border-danger/40 bg-danger/10 text-danger shadow-[var(--control-shadow-active)]'
                                                    : 'border-success/40 bg-success/10 text-success shadow-[var(--control-shadow-active)]'
                                                : 'border-transparent text-foreground-secondary hover:bg-surface-muted hover:text-foreground',
                                        )}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span>{typeOption.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.type && (
                            <span className="text-xs font-normal text-danger">
                                {errors.type}
                            </span>
                        )}
                    </div>

                    {/* 2. Nama Kategori + Preset Cepat + Live Preview */}
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                        <div className="grid gap-2.5">
                            <TextField
                                label="Nama kategori"
                                name="name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Contoh: Langganan & Digital"
                                maxLength={60}
                                autoFocus
                                required
                                error={errors.name}
                            />

                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="mr-1 text-[11px] font-light text-muted-foreground">
                                    Preset cepat:
                                </span>
                                {categoryPresets[selectedType].map((preset) => {
                                    const PresetIcon =
                                        categoryIcons[preset.icon] ?? Tags;
                                    const active =
                                        name.trim().toLowerCase() ===
                                        preset.name.toLowerCase();

                                    return (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => applyPreset(preset)}
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium transition-all active:scale-95',
                                                active
                                                    ? 'border-primary/40 bg-primary-soft text-primary'
                                                    : 'border-border-strong/60 bg-surface text-foreground-secondary hover:border-primary/30 hover:bg-primary-soft/60 hover:text-primary',
                                            )}
                                        >
                                            <PresetIcon className="h-3.5 w-3.5" />
                                            {preset.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Live Preview Kartu Kategori */}
                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--control-border)] bg-[var(--control-background)] px-4 py-3 shadow-[var(--control-shadow)] lg:min-w-64">
                            <div className="flex min-w-0 items-center gap-3">
                                <div
                                    className={cn(
                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                                        previewColorClass,
                                    )}
                                >
                                    <PreviewIcon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-light text-muted-foreground">
                                        Pratinjau
                                    </p>
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {name.trim() || 'Nama Kategori'}
                                    </p>
                                </div>
                            </div>
                            <Badge
                                variant={
                                    selectedType === 'income'
                                        ? 'success'
                                        : 'danger'
                                }
                            >
                                {selectedType === 'income'
                                    ? 'Pemasukan'
                                    : 'Pengeluaran'}
                            </Badge>
                        </div>
                    </div>

                    {/* 3. Pilihan Warna Visual (1-Tap Swatches) */}
                    <div className="grid gap-2">
                        <span className="text-xs font-medium text-foreground-secondary">
                            Warna aksen
                        </span>
                        <div
                            role="radiogroup"
                            aria-label="Warna kategori"
                            className="flex flex-wrap items-center gap-2"
                        >
                            {colorOptions.map((color) => {
                                const active = selectedColor === color.value;
                                const style = colorStyles[color.value];

                                return (
                                    <button
                                        key={color.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() =>
                                            setSelectedColor(color.value)
                                        }
                                        className={cn(
                                            'inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all duration-150',
                                            active
                                                ? 'border-primary/50 bg-primary-soft/80 text-foreground shadow-[var(--control-shadow-active)]'
                                                : 'border-[var(--control-border)] bg-[var(--control-background)] text-foreground-secondary hover:border-primary/30 hover:bg-surface-muted',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'h-3.5 w-3.5 rounded-full',
                                                style?.swatchClass ??
                                                    'bg-muted-foreground',
                                            )}
                                        />
                                        <span>{color.label}</span>
                                        {active && (
                                            <Check className="h-3.5 w-3.5 text-primary" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.color_token && (
                            <span className="text-xs font-normal text-danger">
                                {errors.color_token}
                            </span>
                        )}
                    </div>

                    {/* 4. Pilihan Ikon Visual (1-Tap Grid) */}
                    <div className="grid gap-2">
                        <span className="text-xs font-medium text-foreground-secondary">
                            Ikon kategori
                        </span>
                        <div
                            role="radiogroup"
                            aria-label="Ikon kategori"
                            className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5"
                        >
                            {iconOptions.map((iconOption) => {
                                const Icon =
                                    categoryIcons[iconOption.value] ?? Tags;
                                const active =
                                    selectedIcon === iconOption.value;

                                return (
                                    <button
                                        key={iconOption.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() =>
                                            setSelectedIcon(iconOption.value)
                                        }
                                        className={cn(
                                            'flex min-h-12 items-center justify-between gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-all duration-150',
                                            active
                                                ? 'border-primary/50 bg-primary-soft/80 text-foreground shadow-[var(--control-shadow-active)]'
                                                : 'border-[var(--control-border)] bg-[var(--control-background)] text-foreground-secondary hover:border-primary/30 hover:bg-surface-muted',
                                        )}
                                    >
                                        <span className="flex min-w-0 items-center gap-2.5">
                                            <span
                                                className={cn(
                                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors',
                                                    active
                                                        ? previewColorClass
                                                        : 'bg-surface-muted text-muted-foreground',
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <span className="truncate text-xs font-medium">
                                                {iconOption.label}
                                            </span>
                                        </span>
                                        {active && (
                                            <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.icon && (
                            <span className="text-xs font-normal text-danger">
                                {errors.icon}
                            </span>
                        )}
                    </div>

                    {/* 5. Tombol Aksi Responsif */}
                    <div className="flex flex-col-reverse gap-2.5 border-t border-border pt-5 sm:flex-row sm:justify-end">
                        <ButtonLink
                            href={cancelUrl}
                            variant="ghost"
                            size="md"
                            className="w-full sm:w-auto"
                        >
                            Batal
                        </ButtonLink>
                        <Button
                            type="submit"
                            size="md"
                            loading={processing}
                            className="w-full sm:w-auto"
                        >
                            <Save className="h-4 w-4" />
                            {submitLabel}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

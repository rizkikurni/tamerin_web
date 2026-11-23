import { Form } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    CalendarDays,
    Car,
    Check,
    CircleDollarSign,
    Gift,
    GraduationCap,
    HeartPulse,
    House,
    RotateCcw,
    Save,
    ShoppingCart,
    Tags,
    Utensils,
    Wallet,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import Button from '@/components/ui/button';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { store, update } from '@/routes/budgets';
import type {
    BudgetCategoryOption,
    BudgetListItem,
    DashboardPeriod,
} from '@/types';

type BudgetFormDialogProps = {
    open: boolean;
    period: DashboardPeriod;
    categoryOptions: BudgetCategoryOption[];
    budget: BudgetListItem | null;
    initialCategoryId?: string | null;
    onClose: () => void;
};

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

const colorClasses: Record<string, string> = {
    blue: 'bg-primary-soft text-primary',
    green: 'bg-success/10 text-success',
    violet: 'bg-secondary-soft text-secondary',
    amber: 'bg-warning/10 text-warning',
    rose: 'bg-danger/10 text-danger',
};

const quickBudgetAmounts = [
    { label: '+100rb', value: 100_000 },
    { label: '+250rb', value: 250_000 },
    { label: '+500rb', value: 500_000 },
    { label: '+1jt', value: 1_000_000 },
    { label: '+2jt', value: 2_000_000 },
];

function formatThousand(value: number): string {
    if (value <= 0) {
        return '';
    }

    return new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 0,
    }).format(value);
}

export default function BudgetFormDialog({
    open,
    period,
    categoryOptions,
    budget,
    initialCategoryId,
    onClose,
}: BudgetFormDialogProps) {
    const isEditing = budget !== null;

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
        () => initialCategoryId || categoryOptions[0]?.value || '',
    );
    const [amount, setAmount] = useState<number>(() => budget?.amount ?? 0);

    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    const form = isEditing ? update.form.patch(budget.id) : store.form();

    const handleAmountInput = (rawValue: string) => {
        const digitsOnly = rawValue.replace(/\D/g, '');

        if (!digitsOnly) {
            setAmount(0);

            return;
        }

        const parsed = Number.parseInt(digitsOnly.slice(0, 15), 10);

        setAmount(Number.isNaN(parsed) ? 0 : parsed);
    };

    const EditingIcon = isEditing
        ? (categoryIcons[budget.category.icon ?? ''] ?? Tags)
        : Wallet;
    const editingBadgeColor = isEditing
        ? (colorClasses[budget.category.color_token ?? ''] ??
          'bg-primary-soft text-primary')
        : 'bg-primary-soft text-primary';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim)] p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.currentTarget === event.target) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="budget-form-title"
                className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[24px] border border-[var(--glass-border-strong)] bg-surface p-5 shadow-[var(--popup-shadow)] sm:p-6"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                                editingBadgeColor,
                            )}
                        >
                            <EditingIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h2
                                id="budget-form-title"
                                className="text-base font-medium text-foreground sm:text-lg"
                            >
                                {isEditing
                                    ? `Ubah budget ${budget.category.name}`
                                    : 'Buat budget bulanan'}
                            </h2>
                            <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                Periode {period.label}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Tutup dialog"
                        onClick={onClose}
                        className="rounded-full p-2 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <Form
                    key={
                        budget?.id ??
                        `create-budget-${initialCategoryId ?? 'default'}`
                    }
                    {...form}
                    onSuccess={onClose}
                    className="mt-5 grid gap-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <input
                                type="hidden"
                                name="amount"
                                value={amount > 0 ? String(amount) : ''}
                            />

                            {!isEditing && (
                                <>
                                    <input
                                        type="hidden"
                                        name="period"
                                        value={period.value}
                                    />
                                    <input
                                        type="hidden"
                                        name="category_id"
                                        value={selectedCategoryId}
                                    />

                                    <div className="grid gap-2">
                                        <span className="text-xs font-medium text-foreground-secondary">
                                            Pilih kategori pengeluaran
                                        </span>
                                        <div
                                            role="radiogroup"
                                            aria-label="Kategori pengeluaran"
                                            className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto pr-0.5 sm:grid-cols-2"
                                        >
                                            {categoryOptions.map((category) => {
                                                const active =
                                                    selectedCategoryId ===
                                                    category.value;
                                                const CategoryIcon =
                                                    categoryIcons[
                                                        category.icon ?? ''
                                                    ] ?? Tags;
                                                const badgeColor =
                                                    colorClasses[
                                                        category.color_token ??
                                                            ''
                                                    ] ??
                                                    'bg-surface-muted text-muted-foreground';

                                                return (
                                                    <button
                                                        key={category.value}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={active}
                                                        onClick={() =>
                                                            setSelectedCategoryId(
                                                                category.value,
                                                            )
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
                                                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                                                                    badgeColor,
                                                                )}
                                                            >
                                                                <CategoryIcon className="h-4 w-4" />
                                                            </span>
                                                            <span className="truncate text-xs font-medium sm:text-sm">
                                                                {category.label}
                                                            </span>
                                                        </span>
                                                        {active && (
                                                            <Check className="h-4 w-4 shrink-0 text-primary" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.category_id && (
                                            <span className="text-xs font-normal text-danger">
                                                {errors.category_id}
                                            </span>
                                        )}
                                        {errors.period && (
                                            <span className="text-xs font-normal text-danger">
                                                {errors.period}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}

                            {isEditing && (
                                <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-primary-soft/50 px-4 py-3 dark:border-border dark:bg-background/60">
                                    <div className="flex items-center gap-2.5">
                                        <CalendarDays className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-light text-muted-foreground">
                                            Terpakai bulan ini
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-foreground">
                                        {formatRupiah(budget.spent)} (
                                        {budget.percentage}%)
                                    </span>
                                </div>
                            )}

                            {/* Input Nominal Budget Besar + Quick Chips */}
                            <div className="grid gap-2.5 rounded-2xl border border-[var(--control-border)] bg-[var(--control-background)] p-4 shadow-[var(--control-shadow)]">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="budget-amount-display"
                                        className="text-xs font-medium text-foreground-secondary"
                                    >
                                        Batas nominal budget
                                    </label>
                                    {amount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setAmount(0)}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-normal text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                            Reset
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-baseline gap-2.5 border-b border-border/80 pb-2.5 focus-within:border-primary">
                                    <span className="text-lg font-medium text-muted-foreground sm:text-xl">
                                        Rp
                                    </span>
                                    <input
                                        id="budget-amount-display"
                                        type="text"
                                        inputMode="numeric"
                                        autoFocus
                                        value={formatThousand(amount)}
                                        onChange={(event) =>
                                            handleAmountInput(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="0"
                                        className="w-full bg-transparent text-2xl font-medium tracking-tight text-foreground outline-none placeholder:font-light placeholder:text-muted-foreground/60 sm:text-3xl"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    {quickBudgetAmounts.map((quick) => (
                                        <button
                                            key={quick.label}
                                            type="button"
                                            onClick={() =>
                                                setAmount(
                                                    (current) =>
                                                        current + quick.value,
                                                )
                                            }
                                            className="rounded-xl border border-border-strong/60 bg-surface px-3 py-1.5 text-xs font-medium text-foreground-secondary transition-all hover:border-primary/40 hover:bg-primary-soft hover:text-primary active:scale-95"
                                        >
                                            {quick.label}
                                        </button>
                                    ))}
                                </div>

                                {errors.amount && (
                                    <span className="text-xs font-normal text-danger">
                                        {errors.amount}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col-reverse gap-2.5 border-t border-border pt-4 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="md"
                                    disabled={processing}
                                    onClick={onClose}
                                    className="w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    size="md"
                                    loading={processing}
                                    className="w-full sm:w-auto"
                                >
                                    <Save className="h-4 w-4" />
                                    {isEditing
                                        ? 'Simpan perubahan'
                                        : 'Simpan budget'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}

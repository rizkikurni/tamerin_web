import { router } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    CalendarDays,
    ChevronDown,
    Layers,
    RotateCcw,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

import { SelectField, TextField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { index } from '@/routes/transactions';
import type { TransactionFilterOptions, TransactionFilters } from '@/types';

type TransactionFiltersProps = {
    filters: TransactionFilters;
    options: TransactionFilterOptions;
};

type FilterFormState = {
    date_from: string;
    date_to: string;
    type: string;
    account_id: string;
    category_id: string;
    status: string;
};

function toDateInputString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getDatePresets(): Array<{
    id: string;
    label: string;
    date_from: string;
    date_to: string;
}> {
    const now = new Date();
    const todayStr = toDateInputString(now);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    const sevenDaysAgoStr = toDateInputString(sevenDaysAgo);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return [
        {
            id: 'today',
            label: 'Hari ini',
            date_from: todayStr,
            date_to: todayStr,
        },
        {
            id: '7d',
            label: '7 Hari',
            date_from: sevenDaysAgoStr,
            date_to: todayStr,
        },
        {
            id: 'month',
            label: 'Bulan ini',
            date_from: toDateInputString(startOfMonth),
            date_to: toDateInputString(endOfMonth),
        },
    ];
}

export default function TransactionFiltersForm({
    filters,
    options,
}: TransactionFiltersProps) {
    const [values, setValues] = useState<FilterFormState>({
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        type: filters.type ?? '',
        account_id: filters.account_id ?? '',
        category_id: filters.category_id ?? '',
        status: filters.status ?? '',
    });

    const advancedFilterCount = [
        filters.date_from,
        filters.date_to,
        filters.account_id,
        filters.category_id,
        filters.status,
    ].filter(Boolean).length;

    const [expanded, setExpanded] = useState(false);
    const datePresets = useMemo(() => getDatePresets(), []);

    const navigateWithFilters = (nextValues: FilterFormState) => {
        setValues(nextValues);

        const query = Object.fromEntries(
            Object.entries(nextValues).filter(([, value]) => value !== ''),
        );

        router.get(index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        navigateWithFilters(values);
        setExpanded(false);
    };

    const resetFilters = () => {
        const cleared: FilterFormState = {
            date_from: '',
            date_to: '',
            type: '',
            account_id: '',
            category_id: '',
            status: '',
        };

        setValues(cleared);
        setExpanded(false);
        router.get(index.url(), {}, { replace: true });
    };

    const selectQuickType = (nextType: string) => {
        const nextCategory =
            nextType === 'transfer'
                ? ''
                : nextType &&
                    values.category_id &&
                    options.categories.find(
                        (category) => category.id === values.category_id,
                    )?.type !== nextType
                  ? ''
                  : values.category_id;

        navigateWithFilters({
            ...values,
            type: nextType,
            category_id: nextCategory,
        });
    };

    const selectDatePreset = (dateFrom: string, dateTo: string) => {
        const isAlreadySelected =
            values.date_from === dateFrom && values.date_to === dateTo;

        navigateWithFilters({
            ...values,
            date_from: isAlreadySelected ? '' : dateFrom,
            date_to: isAlreadySelected ? '' : dateTo,
        });
    };

    const clearSingleFilter = (key: keyof FilterFormState) => {
        navigateWithFilters({
            ...values,
            [key]: '',
        });
    };

    const typeTabs = [
        {
            value: '',
            label: 'Semua',
            icon: Layers,
            activeClass:
                'border-primary/40 bg-primary-soft text-primary shadow-[var(--control-shadow-active)]',
        },
        {
            value: 'expense',
            label: 'Pengeluaran',
            icon: ArrowUpRight,
            activeClass:
                'border-danger/40 bg-danger/10 text-danger shadow-[var(--control-shadow-active)]',
        },
        {
            value: 'income',
            label: 'Pemasukan',
            icon: ArrowDownLeft,
            activeClass:
                'border-success/40 bg-success/10 text-success shadow-[var(--control-shadow-active)]',
        },
        {
            value: 'transfer',
            label: 'Transfer',
            icon: ArrowLeftRight,
            activeClass:
                'border-primary/40 bg-primary-soft text-primary shadow-[var(--control-shadow-active)]',
        },
    ];

    const matchingCategories = useMemo(
        () =>
            values.type === 'income' || values.type === 'expense'
                ? options.categories.filter(
                      (category) => category.type === values.type,
                  )
                : options.categories,
        [options.categories, values.type],
    );

    const activeAccountName = options.accounts.find(
        (account) => account.id === filters.account_id,
    )?.name;
    const activeCategoryName = options.categories.find(
        (category) => category.id === filters.category_id,
    )?.name;
    const activeStatusLabel = options.statuses.find(
        (status) => status.value === filters.status,
    )?.label;
    const hasAnyFilter = Object.values(filters).some(Boolean);

    return (
        <div className="grid gap-3">
            {/* Baris Utama: Quick Type Tabs + Period Presets + Toggle Filter Lanjutan */}
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                <div
                    role="tablist"
                    aria-label="Filter tipe transaksi"
                    className="grid grid-cols-2 gap-1.5 rounded-2xl border border-[var(--control-border)] bg-background/60 p-1.5 sm:grid-cols-4"
                >
                    {typeTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = (filters.type ?? '') === tab.value;

                        return (
                            <button
                                key={tab.label}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => selectQuickType(tab.value)}
                                className={cn(
                                    'flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                                    active
                                        ? tab.activeClass
                                        : 'border-transparent text-foreground-secondary hover:bg-surface-muted hover:text-foreground',
                                )}
                            >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 lg:justify-end">
                    <div className="flex flex-wrap items-center gap-1.5">
                        {datePresets.map((preset) => {
                            const active =
                                filters.date_from === preset.date_from &&
                                filters.date_to === preset.date_to;

                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() =>
                                        selectDatePreset(
                                            preset.date_from,
                                            preset.date_to,
                                        )
                                    }
                                    className={cn(
                                        'inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors',
                                        active
                                            ? 'border-primary/40 bg-primary-soft text-primary'
                                            : 'border-[var(--control-border)] bg-[var(--control-background)] text-foreground-secondary hover:border-primary/30 hover:text-foreground',
                                    )}
                                >
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {hasAnyFilter && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-9 items-center gap-1 rounded-xl px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                setExpanded((currentOpen) => !currentOpen)
                            }
                            aria-expanded={expanded}
                            className={cn(
                                'inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors',
                                expanded || advancedFilterCount > 0
                                    ? 'border-primary/40 bg-primary-soft text-primary'
                                    : 'border-[var(--control-border)] bg-[var(--control-background)] text-foreground-secondary hover:border-primary/30 hover:text-foreground',
                            )}
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            <span>Filter</span>
                            {advancedFilterCount > 0 && (
                                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                                    {advancedFilterCount}
                                </span>
                            )}
                            <ChevronDown
                                className={cn(
                                    'h-3.5 w-3.5 transition-transform duration-200',
                                    expanded && 'rotate-180',
                                )}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Chip Filter Aktif (Bisa Dihapus 1-Klik) */}
            {advancedFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    {filters.date_from && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-soft/75 px-2.5 py-1 text-xs font-normal text-primary">
                            Dari: {filters.date_from}
                            <button
                                type="button"
                                onClick={() => clearSingleFilter('date_from')}
                                aria-label="Hapus filter dari tanggal"
                                className="rounded-full p-0.5 hover:bg-primary/15"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {filters.date_to && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-soft/75 px-2.5 py-1 text-xs font-normal text-primary">
                            Sampai: {filters.date_to}
                            <button
                                type="button"
                                onClick={() => clearSingleFilter('date_to')}
                                aria-label="Hapus filter sampai tanggal"
                                className="rounded-full p-0.5 hover:bg-primary/15"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {activeAccountName && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-soft/75 px-2.5 py-1 text-xs font-normal text-primary">
                            Akun: {activeAccountName}
                            <button
                                type="button"
                                onClick={() => clearSingleFilter('account_id')}
                                aria-label="Hapus filter akun"
                                className="rounded-full p-0.5 hover:bg-primary/15"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {activeCategoryName && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-soft/75 px-2.5 py-1 text-xs font-normal text-primary">
                            Kategori: {activeCategoryName}
                            <button
                                type="button"
                                onClick={() => clearSingleFilter('category_id')}
                                aria-label="Hapus filter kategori"
                                className="rounded-full p-0.5 hover:bg-primary/15"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {activeStatusLabel && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-soft/75 px-2.5 py-1 text-xs font-normal text-primary">
                            Status: {activeStatusLabel}
                            <button
                                type="button"
                                onClick={() => clearSingleFilter('status')}
                                aria-label="Hapus filter status"
                                className="rounded-full p-0.5 hover:bg-primary/15"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}

            {/* Panel Filter Lanjutan (Collapsible) */}
            {expanded && (
                <form
                    onSubmit={applyFilters}
                    className="grid gap-4 rounded-2xl border border-border/80 bg-background/40 p-4"
                >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <TextField
                            label="Dari tanggal"
                            name="date_from"
                            type="date"
                            value={values.date_from}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    date_from: event.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="Sampai tanggal"
                            name="date_to"
                            type="date"
                            value={values.date_to}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    date_to: event.target.value,
                                }))
                            }
                        />
                        <SelectField
                            label="Akun"
                            name="account_id"
                            value={values.account_id}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    account_id: event.target.value,
                                }))
                            }
                        >
                            <option value="">Semua akun</option>
                            {options.accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </SelectField>
                        <SelectField
                            label="Kategori"
                            name="category_id"
                            value={values.category_id}
                            disabled={values.type === 'transfer'}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    category_id: event.target.value,
                                }))
                            }
                        >
                            <option value="">Semua kategori</option>
                            {matchingCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </SelectField>
                        <SelectField
                            label="Status"
                            name="status"
                            value={values.status}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    status: event.target.value,
                                }))
                            }
                        >
                            <option value="">Semua status</option>
                            {options.statuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset Semua
                        </Button>
                        <Button type="submit" size="sm">
                            <Search className="h-4 w-4" />
                            Terapkan Filter
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

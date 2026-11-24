import { router } from '@inertiajs/react';
import {
    CircleDollarSign,
    Filter,
    HandCoins,
    Layers3,
    PiggyBank,
    ReceiptText,
    RotateCcw,
    Search,
    TrendingUp,
    WalletCards,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';

import { SelectField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { index } from '@/routes/reports';
import type {
    FinancialCycleInfo,
    ReportFilterOptions,
    ReportFilters,
    ReportType,
    SelectOption,
} from '@/types';

type ReportFiltersProps = {
    filters: ReportFilters;
    reportOptions: SelectOption[];
    filterOptions: ReportFilterOptions;
    statusOptions: SelectOption[];
    financialCycle?: FinancialCycleInfo;
};

const reportTypeIcons: Record<string, ReactNode> = {
    cash_flow: <TrendingUp className="h-4 w-4" />,
    transactions: <ReceiptText className="h-4 w-4" />,
    budgets: <Layers3 className="h-4 w-4" />,
    savings: <PiggyBank className="h-4 w-4" />,
    investments: <CircleDollarSign className="h-4 w-4" />,
    net_worth: <WalletCards className="h-4 w-4" />,
    obligations: <HandCoins className="h-4 w-4" />,
};

function formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getCyclePresets(startDay: number = 1): {
    thisCycle: [string, string];
    lastCycle: [string, string];
    last3Cycles: [string, string];
    thisYear: [string, string];
} {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (startDay <= 1) {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
        );

        const startOfLastMonth = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1,
        );
        const endOfLastMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            0,
        );

        const startOf3Months = new Date(
            today.getFullYear(),
            today.getMonth() - 2,
            1,
        );
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        return {
            thisCycle: [formatDate(startOfMonth), formatDate(endOfMonth)],
            lastCycle: [
                formatDate(startOfLastMonth),
                formatDate(endOfLastMonth),
            ],
            last3Cycles: [formatDate(startOf3Months), formatDate(today)],
            thisYear: [formatDate(startOfYear), formatDate(today)],
        };
    }

    const currentDay = today.getDate();
    let cycleStartMonth = today.getMonth();
    let cycleStartYear = today.getFullYear();

    if (currentDay < startDay) {
        cycleStartMonth -= 1;

        if (cycleStartMonth < 0) {
            cycleStartMonth = 11;
            cycleStartYear -= 1;
        }
    }

    const currentCycleStart = new Date(
        cycleStartYear,
        cycleStartMonth,
        startDay,
    );
    const currentCycleEnd = new Date(
        cycleStartYear,
        cycleStartMonth + 1,
        startDay - 1,
    );

    const lastCycleStart = new Date(
        cycleStartYear,
        cycleStartMonth - 1,
        startDay,
    );
    const lastCycleEnd = new Date(
        cycleStartYear,
        cycleStartMonth,
        startDay - 1,
    );

    const threeCyclesStart = new Date(
        cycleStartYear,
        cycleStartMonth - 2,
        startDay,
    );
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    return {
        thisCycle: [formatDate(currentCycleStart), formatDate(currentCycleEnd)],
        lastCycle: [formatDate(lastCycleStart), formatDate(lastCycleEnd)],
        last3Cycles: [
            formatDate(threeCyclesStart),
            formatDate(currentCycleEnd),
        ],
        thisYear: [formatDate(startOfYear), formatDate(currentCycleEnd)],
    };
}

export default function ReportFiltersForm({
    filters,
    reportOptions,
    filterOptions,
    statusOptions,
    financialCycle,
}: ReportFiltersProps) {
    const [values, setValues] = useState({
        report_type: filters.report_type,
        date_from: filters.date_from,
        date_to: filters.date_to,
        account_id: filters.account_id ?? '',
        category_id: filters.category_id ?? '',
        status: filters.status ?? '',
    });

    const startDay = financialCycle?.startDay ?? 1;
    const presets = getCyclePresets(startDay);
    const isCustomCycle = startDay > 1;

    const isCurrentActive =
        values.date_from === presets.thisCycle[0] &&
        values.date_to === presets.thisCycle[1];
    const isLastActive =
        values.date_from === presets.lastCycle[0] &&
        values.date_to === presets.lastCycle[1];
    const is3MonthsActive =
        values.date_from === presets.last3Cycles[0] &&
        values.date_to === presets.last3Cycles[1];
    const isThisYearActive =
        values.date_from === presets.thisYear[0] &&
        values.date_to === presets.thisYear[1];

    const submitWithParams = (params: typeof values) => {
        router.get(
            index.url(),
            Object.fromEntries(
                Object.entries(params).filter(([, value]) => value !== ''),
            ),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submitWithParams(values);
    };

    const selectReportType = (type: ReportType) => {
        const next = { ...values, report_type: type, status: '' };
        setValues(next);
        submitWithParams(next);
    };

    const applyDatePreset = (from: string, to: string) => {
        const next = { ...values, date_from: from, date_to: to };
        setValues(next);
        submitWithParams(next);
    };

    const resetFilters = () => {
        router.get(index.url(), {}, { replace: true });
    };

    return (
        <form onSubmit={applyFilters} className="grid gap-4">
            {/* Quick Report Type Pills */}
            <div className="grid gap-2 border-b border-border/70 pb-3">
                <label className="text-xs font-medium text-foreground">
                    Jenis Laporan
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {reportOptions.map((opt) => {
                        const isSelected = values.report_type === opt.value;
                        const icon = reportTypeIcons[opt.value] ?? (
                            <Filter className="h-4 w-4" />
                        );

                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() =>
                                    selectReportType(opt.value as ReportType)
                                }
                                className={cn(
                                    'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95',
                                    isSelected
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'border border-border/80 bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground',
                                )}
                            >
                                {icon}
                                <span>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Date Range & Presets */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
                <div className="grid gap-1.5">
                    <label
                        htmlFor="date_from"
                        className="text-xs font-medium text-foreground"
                    >
                        Dari tanggal
                    </label>
                    <input
                        id="date_from"
                        name="date_from"
                        type="date"
                        value={values.date_from}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                date_from: event.target.value,
                            }))
                        }
                        className="border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] focus:ring-1 focus:outline-none"
                    />
                </div>

                <div className="grid gap-1.5">
                    <label
                        htmlFor="date_to"
                        className="text-xs font-medium text-foreground"
                    >
                        Sampai tanggal
                    </label>
                    <input
                        id="date_to"
                        name="date_to"
                        type="date"
                        value={values.date_to}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                date_to: event.target.value,
                            }))
                        }
                        className="border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] focus:ring-1 focus:outline-none"
                    />
                </div>

                {/* Date presets */}
                <div className="grid gap-1.5 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-foreground">
                            Pintasan Periode
                        </label>
                        {isCustomCycle && (
                            <span className="text-[11px] font-medium text-primary">
                                Siklus Tgl {startDay}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <button
                            type="button"
                            onClick={() => {
                                applyDatePreset(
                                    presets.thisCycle[0],
                                    presets.thisCycle[1],
                                );
                            }}
                            className={cn(
                                'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                                isCurrentActive
                                    ? 'border-primary bg-primary-soft text-primary shadow-sm'
                                    : 'border-border/80 bg-surface text-foreground hover:bg-surface-muted',
                            )}
                        >
                            {isCustomCycle ? 'Siklus Ini' : 'Bulan Ini'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                applyDatePreset(
                                    presets.lastCycle[0],
                                    presets.lastCycle[1],
                                );
                            }}
                            className={cn(
                                'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                                isLastActive
                                    ? 'border-primary bg-primary-soft text-primary shadow-sm'
                                    : 'border-border/80 bg-surface text-foreground hover:bg-surface-muted',
                            )}
                        >
                            {isCustomCycle ? 'Siklus Lalu' : 'Bulan Lalu'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                applyDatePreset(
                                    presets.last3Cycles[0],
                                    presets.last3Cycles[1],
                                );
                            }}
                            className={cn(
                                'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                                is3MonthsActive
                                    ? 'border-primary bg-primary-soft text-primary shadow-sm'
                                    : 'border-border/80 bg-surface text-foreground hover:bg-surface-muted',
                            )}
                        >
                            3 Bulan
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                applyDatePreset(
                                    presets.thisYear[0],
                                    presets.thisYear[1],
                                );
                            }}
                            className={cn(
                                'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                                isThisYearActive
                                    ? 'border-primary bg-primary-soft text-primary shadow-sm'
                                    : 'border-border/80 bg-surface text-foreground hover:bg-surface-muted',
                            )}
                        >
                            Tahun Ini
                        </button>
                    </div>
                </div>
            </div>

            {/* Secondary filters: Akun, Kategori, Status */}
            <div className="grid gap-3 pt-1 sm:grid-cols-3">
                <SelectField
                    label="Akun keuangan"
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
                    {filterOptions.accounts.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>

                <SelectField
                    label="Kategori"
                    name="category_id"
                    value={values.category_id}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            category_id: event.target.value,
                        }))
                    }
                >
                    <option value="">Semua kategori</option>
                    {filterOptions.categories.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
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
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="rounded-full"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="rounded-full px-5"
                >
                    <Search className="h-4 w-4" />
                    Tampilkan Laporan
                </Button>
            </div>
        </form>
    );
}

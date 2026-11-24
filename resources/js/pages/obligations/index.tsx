import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarClock,
    HandCoins,
    Plus,
    RotateCcw,
    Search,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import SummaryCard from '@/components/dashboard/summary-card';
import { SelectField, StatusMessage } from '@/components/form-controls';
import ObligationCard from '@/components/obligations/obligation-card';
import { ButtonLink } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { create, index } from '@/routes/obligations';
import type {
    ObligationFilters,
    ObligationListItem,
    ObligationSummary,
    PaginatedData,
    SelectOption,
} from '@/types';

type Props = {
    obligations: PaginatedData<ObligationListItem>;
    summary: ObligationSummary;
    filters: ObligationFilters;
    kindOptions: SelectOption[];
    statusOptions: SelectOption[];
    dueFilterOptions: SelectOption[];
};

export default function ObligationIndex({
    obligations,
    summary,
    filters,
    kindOptions,
    statusOptions,
    dueFilterOptions,
}: Props) {
    const { flash } = usePage().props;
    const hasFilter = Object.values(filters).some(Boolean);
    const [searchVal, setSearchVal] = useState(filters.search ?? '');

    const applyFilter = (key: keyof ObligationFilters, value: string) => {
        router.get(
            index.url(),
            { ...filters, [key]: value || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilter('search', searchVal);
    };

    const resetFilters = () => {
        setSearchVal('');
        router.get(index.url(), {}, { preserveScroll: true });
    };

    const kindTabs = [
        { label: 'Semua Catatan', value: '' },
        ...kindOptions.map((opt) => ({
            label: opt.label,
            value: opt.value,
        })),
    ];

    return (
        <AppLayout
            title="Utang & Piutang"
            description="Pantau kewajiban utang, tagihan piutang, tanggal jatuh tempo, dan cicilan."
            breadcrumbs={[{ label: 'Kekayaan' }, { label: 'Utang & Piutang' }]}
            currentPath={index.url()}
            headerActions={
                <ButtonLink
                    href={create.url()}
                    size="sm"
                    className="rounded-full px-4 shadow-[var(--control-shadow)]"
                >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Catatan</span>
                </ButtonLink>
            }
        >
            <Head title="Utang & Piutang" />

            <div className="grid w-full gap-5">
                <StatusMessage message={flash.status} />

                {/* Summary Cards */}
                <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Utang Berjalan"
                        value={formatRupiah(summary.totalDebt)}
                        comparison="Sisa kewajiban yang perlu Anda bayar"
                        icon={<TrendingDown className="h-5 w-5 text-danger" />}
                        iconBg="bg-danger/10"
                    />
                    <SummaryCard
                        title="Total Piutang Berjalan"
                        value={formatRupiah(summary.totalReceivable)}
                        comparison="Sisa tagihan yang perlu Anda terima"
                        icon={<TrendingUp className="h-5 w-5 text-success" />}
                        iconBg="bg-success/10"
                    />
                    <SummaryCard
                        title="Jatuh Tempo 7 Hari"
                        value={summary.dueSoonCount.toString()}
                        comparison="Perlu segera ditindaklanjuti"
                        icon={
                            <CalendarClock className="h-5 w-5 text-warning" />
                        }
                        iconBg="bg-warning/10"
                    />
                    <SummaryCard
                        title="Terlambat"
                        value={summary.overdueCount.toString()}
                        comparison="Sudah melewati batas tanggal tempo"
                        icon={<AlertTriangle className="h-5 w-5 text-danger" />}
                        iconBg="bg-danger/10"
                    />
                </div>

                {/* Filter and Kind Segmented Tabs */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--control-shadow)]">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            {kindTabs.map((tab) => {
                                const isActive =
                                    (filters.kind ?? '') === tab.value;

                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() =>
                                            applyFilter('kind', tab.value)
                                        }
                                        className={cn(
                                            'inline-flex shrink-0 items-center rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95',
                                            isActive
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {hasFilter && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1 text-xs font-light text-muted-foreground hover:text-foreground"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Reset filter
                            </button>
                        )}
                    </div>

                    {/* Search and Secondary Filters */}
                    <div className="grid gap-3 pt-1 sm:grid-cols-[1.2fr_1fr_1fr]">
                        <form
                            onSubmit={handleSearch}
                            className="grid min-w-0 gap-2 text-xs font-medium text-foreground-secondary"
                        >
                            <label
                                htmlFor="obligation-search"
                                className="text-xs font-medium text-foreground-secondary"
                            >
                                Cari pihak / catatan
                            </label>
                            <div className="relative">
                                <input
                                    id="obligation-search"
                                    type="text"
                                    value={searchVal}
                                    onChange={(e) =>
                                        setSearchVal(e.target.value)
                                    }
                                    placeholder="Cari nama pihak atau catatan..."
                                    className="h-11 w-full rounded-[14px] border border-[var(--control-border)] bg-[var(--control-background)] pr-10 pl-3.5 text-sm font-normal text-foreground shadow-[var(--control-shadow)] backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-200 outline-none placeholder:font-light placeholder:text-muted-foreground hover:border-primary/35 hover:bg-surface-muted/80 hover:shadow-[var(--control-shadow-hover)] focus:border-primary/60 focus:bg-surface-muted focus:ring-2 focus:ring-primary/15"
                                />
                                <button
                                    type="submit"
                                    aria-label="Cari pihak"
                                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            </div>
                        </form>

                        <SelectField
                            label="Status pembayaran"
                            name="status"
                            value={filters.status ?? ''}
                            onChange={(event) =>
                                applyFilter('status', event.target.value)
                            }
                        >
                            <option value="">Semua status</option>
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            label="Kondisi tempo"
                            name="due_filter"
                            value={filters.due_filter ?? ''}
                            onChange={(event) =>
                                applyFilter('due_filter', event.target.value)
                            }
                        >
                            <option value="">Semua kondisi tempo</option>
                            {dueFilterOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                </div>

                {/* Obligations List */}
                {obligations.data.length === 0 ? (
                    <EmptyState
                        icon={<HandCoins className="h-7 w-7 text-primary" />}
                        title={
                            hasFilter
                                ? 'Tidak ada data dengan filter ini'
                                : 'Belum ada catatan utang & piutang'
                        }
                        description={
                            hasFilter
                                ? 'Coba ganti filter atau kata kunci pencarian.'
                                : 'Catat utang atau piutang untuk memantau sisa saldo dan tanggal jatuh tempo.'
                        }
                        action={
                            hasFilter ? (
                                <button
                                    type="button"
                                    className="text-sm font-medium text-primary hover:underline"
                                    onClick={resetFilters}
                                >
                                    Reset semua filter
                                </button>
                            ) : (
                                <ButtonLink
                                    href={create.url()}
                                    className="rounded-full"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah catatan pertama
                                </ButtonLink>
                            )
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {obligations.data.map((obligation) => (
                                <ObligationCard
                                    key={obligation.id}
                                    obligation={obligation}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <p className="text-xs font-light text-muted-foreground">
                                Menampilkan {obligations.from}–{obligations.to}{' '}
                                dari {obligations.total} catatan
                            </p>
                            <Pagination links={obligations.links} />
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

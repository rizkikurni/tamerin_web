import { Head, router, usePage } from '@inertiajs/react';
import {
    CircleDollarSign,
    Clock3,
    Landmark,
    Plus,
    RotateCcw,
    TrendingUp,
} from 'lucide-react';

import SummaryCard from '@/components/dashboard/summary-card';
import { SelectField, StatusMessage } from '@/components/form-controls';
import InvestmentCard from '@/components/investments/investment-card';
import { ButtonLink } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { create, index } from '@/routes/investments';
import type {
    InvestmentFilters,
    InvestmentListItem,
    InvestmentSummary,
    PaginatedData,
    SelectOption,
} from '@/types';

type InvestmentIndexProps = {
    investments: PaginatedData<InvestmentListItem>;
    summary: InvestmentSummary;
    filters: InvestmentFilters;
    instrumentOptions: SelectOption[];
    statusOptions: SelectOption[];
    valuationConditionOptions: SelectOption[];
};

export default function InvestmentIndex({
    investments,
    summary,
    filters,
    instrumentOptions,
    statusOptions,
    valuationConditionOptions,
}: InvestmentIndexProps) {
    const { flash } = usePage().props;
    const hasFilter = Object.values(filters).some(Boolean);

    const applyFilter = (key: keyof InvestmentFilters, value: string) => {
        router.get(
            index.url(),
            { ...filters, [key]: value || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    const resetFilters = () => {
        router.get(index.url(), {}, { preserveScroll: true });
    };

    const statusTabs = [
        { label: 'Semua Status', key: 'status' as const, value: '' },
        ...statusOptions.map((opt) => ({
            label: opt.label,
            key: 'status' as const,
            value: opt.value,
        })),
    ];

    return (
        <AppLayout
            title="Investasi"
            description="Pantau modal, nilai terkini, dan performa setiap holding portofolio."
            breadcrumbs={[{ label: 'Kekayaan' }, { label: 'Investasi' }]}
            currentPath={index.url()}
            headerActions={
                <ButtonLink
                    href={create.url()}
                    size="sm"
                    className="rounded-full px-4 shadow-[var(--control-shadow)]"
                >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Investasi</span>
                </ButtonLink>
            }
        >
            <Head title="Investasi" />

            <div className="grid w-full gap-5">
                <StatusMessage message={flash.status} />

                {/* Summary Cards */}
                <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Nilai Terbaru"
                        value={formatRupiah(summary.totalCurrentValue)}
                        comparison="Total valuasi aktif terbaru"
                        icon={<TrendingUp className="h-5 w-5 text-primary" />}
                        iconBg="bg-primary-soft"
                    />
                    <SummaryCard
                        title="Total Modal"
                        value={formatRupiah(summary.totalAcquisitionCost)}
                        comparison="Modal holding aktif"
                        icon={<Landmark className="h-5 w-5 text-accent" />}
                        iconBg="bg-accent-soft"
                    />
                    <SummaryCard
                        title="Estimasi Untung/Rugi"
                        value={formatRupiah(summary.profitLoss)}
                        comparison="Nilai terbaru dikurangi modal"
                        icon={
                            <CircleDollarSign
                                className={`h-5 w-5 ${summary.profitLoss >= 0 ? 'text-success' : 'text-danger'}`}
                            />
                        }
                        iconBg={
                            summary.profitLoss >= 0
                                ? 'bg-success/10'
                                : 'bg-danger/10'
                        }
                    />
                    <SummaryCard
                        title="Perlu Diperbarui"
                        value={summary.staleCount.toString()}
                        comparison="Belum dinilai atau > 30 hari"
                        icon={<Clock3 className="h-5 w-5 text-warning" />}
                        iconBg="bg-warning/10"
                    />
                </div>

                {/* Filter and Status Controls */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--control-shadow)]">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            {statusTabs.map((tab) => {
                                const isActive =
                                    (filters.status ?? '') === tab.value;

                                return (
                                    <button
                                        key={tab.label}
                                        type="button"
                                        onClick={() =>
                                            applyFilter(tab.key, tab.value)
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
                            {summary.staleCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        applyFilter(
                                            'valuation_condition',
                                            filters.valuation_condition ===
                                                'stale'
                                                ? ''
                                                : 'stale',
                                        )
                                    }
                                    className={cn(
                                        'inline-flex shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-all',
                                        filters.valuation_condition === 'stale'
                                            ? 'text-warning-foreground bg-warning shadow-sm'
                                            : 'border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20',
                                    )}
                                >
                                    <Clock3 className="h-3.5 w-3.5" />
                                    <span>Perlu Diperbarui</span>
                                    <span className="bg-warning-foreground/20 rounded-full px-1 text-[10px]">
                                        {summary.staleCount}
                                    </span>
                                </button>
                            )}
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

                    <div className="grid gap-3 pt-1 sm:grid-cols-2">
                        <SelectField
                            label="Jenis instrumen"
                            name="instrument_type"
                            value={filters.instrument_type ?? ''}
                            onChange={(event) =>
                                applyFilter(
                                    'instrument_type',
                                    event.target.value,
                                )
                            }
                        >
                            <option value="">Semua jenis instrumen</option>
                            {instrumentOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>
                        <SelectField
                            label="Kondisi valuasi"
                            name="valuation_condition"
                            value={filters.valuation_condition ?? ''}
                            onChange={(event) =>
                                applyFilter(
                                    'valuation_condition',
                                    event.target.value,
                                )
                            }
                        >
                            <option value="">Semua kondisi valuasi</option>
                            {valuationConditionOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                </div>

                {/* Investments List */}
                {investments.data.length === 0 ? (
                    <EmptyState
                        icon={<TrendingUp className="h-7 w-7 text-primary" />}
                        title={
                            hasFilter
                                ? 'Tidak ada investasi dengan filter ini'
                                : 'Belum ada aset investasi'
                        }
                        description={
                            hasFilter
                                ? 'Coba ubah opsi filter untuk melihat data holding lainnya.'
                                : 'Catat investasi pertama Anda untuk mulai memantau pertumbuhan modal.'
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
                                    Tambah investasi pertama
                                </ButtonLink>
                            )
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {investments.data.map((investment) => (
                                <InvestmentCard
                                    key={investment.id}
                                    investment={investment}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <p className="text-xs font-light text-muted-foreground">
                                Menampilkan {investments.from}–{investments.to}{' '}
                                dari {investments.total} holding
                            </p>
                            <Pagination links={investments.links} />
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

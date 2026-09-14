import { Head, router, usePage } from '@inertiajs/react';
import {
    CircleDollarSign,
    Clock3,
    Landmark,
    Plus,
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

    return (
        <AppLayout
            title="Investasi"
            description="Pantau modal, nilai terkini, dan performa setiap holding."
            breadcrumbs={[{ label: 'Kekayaan' }, { label: 'Investasi' }]}
            currentPath={index.url()}
            headerActions={
                <ButtonLink
                    href={create.url()}
                    size="sm"
                    className="rounded-full px-4"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Investasi</span>
                </ButtonLink>
            }
        >
            <Head title="Investasi" />

            <div className="grid w-full gap-5">
                <StatusMessage message={flash.status} />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                        comparison="Belum dinilai atau lebih dari 30 hari"
                        icon={<Clock3 className="h-5 w-5 text-warning" />}
                        iconBg="bg-warning/10"
                    />
                </div>

                <div className="grid gap-3 rounded-[22px] border border-border bg-surface p-4 shadow-[var(--control-shadow)] sm:grid-cols-3">
                    <SelectField
                        label="Jenis instrumen"
                        name="instrument_type"
                        value={filters.instrument_type ?? ''}
                        onChange={(event) =>
                            applyFilter('instrument_type', event.target.value)
                        }
                    >
                        <option value="">Semua jenis</option>
                        {instrumentOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                    <SelectField
                        label="Status"
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
                        <option value="">Semua kondisi</option>
                        {valuationConditionOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                </div>

                {investments.data.length === 0 ? (
                    <EmptyState
                        icon={<TrendingUp className="h-7 w-7 text-primary" />}
                        title={
                            hasFilter
                                ? 'Tidak ada investasi yang cocok'
                                : 'Belum ada investasi'
                        }
                        description={
                            hasFilter
                                ? 'Ubah atau reset filter untuk melihat holding lain.'
                                : 'Tambahkan holding pertama untuk mulai memantau nilainya.'
                        }
                        action={
                            hasFilter ? (
                                <ButtonLink href={index.url()} variant="ghost">
                                    Reset filter
                                </ButtonLink>
                            ) : (
                                <ButtonLink href={create.url()}>
                                    <Plus className="h-4 w-4" />
                                    Tambah investasi
                                </ButtonLink>
                            )
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
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
                                dari {investments.total} investasi
                            </p>
                            <Pagination links={investments.links} />
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

import { Head, router, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    Coins,
    Package,
    Plus,
    RotateCcw,
    Wallet,
} from 'lucide-react';

import AssetCard from '@/components/assets/asset-card';
import SummaryCard from '@/components/dashboard/summary-card';
import { SelectField, StatusMessage } from '@/components/form-controls';
import { ButtonLink } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { create, index } from '@/routes/assets';
import type {
    AssetFilters,
    AssetListItem,
    AssetSummary,
    PaginatedData,
    SelectOption,
} from '@/types';

type AssetIndexProps = {
    assets: PaginatedData<AssetListItem>;
    summary: AssetSummary;
    filters: AssetFilters;
    assetTypeOptions: SelectOption[];
    statusOptions: SelectOption[];
};

export default function AssetIndex({
    assets,
    summary,
    filters,
    assetTypeOptions,
    statusOptions,
}: AssetIndexProps) {
    const { flash } = usePage().props;
    const hasFilter = Object.values(filters).some(Boolean);

    const applyFilter = (key: keyof AssetFilters, value: string) => {
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
        { label: 'Aktif', key: 'status' as const, value: 'active' },
        { label: 'Diarsipkan', key: 'status' as const, value: 'archived' },
    ];

    return (
        <AppLayout
            title="Aset"
            description="Pantau estimasi nilai aset fisik dan non-investasi yang Anda miliki."
            breadcrumbs={[{ label: 'Kekayaan' }, { label: 'Aset' }]}
            currentPath={index.url()}
            headerActions={
                <ButtonLink
                    href={create.url()}
                    size="sm"
                    className="rounded-full px-4 shadow-[var(--control-shadow)]"
                >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Aset</span>
                </ButtonLink>
            }
        >
            <Head title="Aset" />

            <div className="grid w-full gap-5">
                <StatusMessage message={flash.status} />

                {/* Summary Cards */}
                <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Nilai Aset"
                        value={formatRupiah(summary.totalCurrentValue)}
                        comparison="Estimasi aset aktif saat ini"
                        icon={<Wallet className="h-5 w-5 text-primary" />}
                        iconBg="bg-primary-soft"
                    />
                    <SummaryCard
                        title="Total Perolehan"
                        value={formatRupiah(summary.totalAcquisitionCost)}
                        comparison="Modal awal yang dicatat"
                        icon={<Coins className="h-5 w-5 text-accent" />}
                        iconBg="bg-accent-soft"
                    />
                    <SummaryCard
                        title="Aset Aktif"
                        value={summary.activeCount.toString()}
                        comparison="Tidak termasuk aset diarsipkan"
                        icon={<Package className="h-5 w-5 text-success" />}
                        iconBg="bg-success/10"
                    />
                    <SummaryCard
                        title="Penilaian Terlama"
                        value={
                            summary.oldestValuedOn
                                ? formatDate(summary.oldestValuedOn)
                                : 'Belum ada'
                        }
                        comparison="Aset paling lama belum dinilai ulang"
                        icon={
                            <CalendarClock className="h-5 w-5 text-warning" />
                        }
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
                            label="Jenis aset"
                            name="asset_type"
                            value={filters.asset_type ?? ''}
                            onChange={(event) =>
                                applyFilter('asset_type', event.target.value)
                            }
                        >
                            <option value="">Semua jenis aset</option>
                            {assetTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>
                        <SelectField
                            label="Status aset"
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
                    </div>
                </div>

                {/* Assets List */}
                {assets.data.length === 0 ? (
                    <EmptyState
                        icon={<Package className="h-7 w-7 text-primary" />}
                        title={
                            hasFilter
                                ? 'Tidak ada aset dengan filter ini'
                                : 'Belum ada catatan aset'
                        }
                        description={
                            hasFilter
                                ? 'Coba ubah opsi filter untuk melihat aset lainnya.'
                                : 'Catat aset fisik Anda seperti properti, kendaraan, atau barang berharga.'
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
                                    Tambah aset pertama
                                </ButtonLink>
                            )
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {assets.data.map((asset) => (
                                <AssetCard key={asset.id} asset={asset} />
                            ))}
                        </div>

                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <p className="text-xs font-light text-muted-foreground">
                                Menampilkan {assets.from}–{assets.to} dari{' '}
                                {assets.total} aset
                            </p>
                            <Pagination links={assets.links} />
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

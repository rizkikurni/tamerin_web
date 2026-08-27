import { Head, router, usePage } from '@inertiajs/react';
import { CalendarClock, Coins, Package, Plus, Wallet } from 'lucide-react';

import AssetCard from '@/components/assets/asset-card';
import SummaryCard from '@/components/dashboard/summary-card';
import { SelectField, StatusMessage } from '@/components/form-controls';
import { ButtonLink } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatRupiah } from '@/lib/formatters';
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

    return (
        <AppLayout
            title="Aset"
            description="Pantau estimasi nilai aset non-investasi yang Anda miliki."
            breadcrumbs={[{ label: 'Kekayaan' }, { label: 'Aset' }]}
            currentPath={index.url()}
            headerActions={
                <ButtonLink
                    href={create.url()}
                    size="sm"
                    className="rounded-full px-4"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Aset</span>
                </ButtonLink>
            }
        >
            <Head title="Aset" />

            <div className="mx-auto grid max-w-6xl gap-5">
                <StatusMessage message={flash.status} />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Nilai Aset"
                        value={formatRupiah(summary.totalCurrentValue)}
                        comparison="Estimasi aset aktif"
                        icon={<Wallet className="h-5 w-5 text-primary" />}
                        iconBg="bg-primary-soft"
                    />
                    <SummaryCard
                        title="Total Perolehan"
                        value={formatRupiah(summary.totalAcquisitionCost)}
                        comparison="Hanya nilai yang tersedia"
                        icon={<Coins className="h-5 w-5 text-accent" />}
                        iconBg="bg-accent-soft"
                    />
                    <SummaryCard
                        title="Aset Aktif"
                        value={summary.activeCount.toString()}
                        comparison="Tidak termasuk arsip"
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
                        comparison="Aset yang paling lama belum diperbarui"
                        icon={
                            <CalendarClock className="h-5 w-5 text-warning" />
                        }
                        iconBg="bg-warning/10"
                    />
                </div>

                <div className="grid gap-3 rounded-[22px] border border-border bg-surface p-4 shadow-[var(--control-shadow)] sm:grid-cols-2">
                    <SelectField
                        label="Jenis aset"
                        name="asset_type"
                        value={filters.asset_type ?? ''}
                        onChange={(event) =>
                            applyFilter('asset_type', event.target.value)
                        }
                    >
                        <option value="">Semua jenis</option>
                        {assetTypeOptions.map((option) => (
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
                </div>

                {assets.data.length === 0 ? (
                    <EmptyState
                        icon={<Package className="h-7 w-7 text-primary" />}
                        title={
                            hasFilter
                                ? 'Tidak ada aset yang cocok'
                                : 'Belum ada aset'
                        }
                        description={
                            hasFilter
                                ? 'Ubah atau reset filter untuk melihat aset lain.'
                                : 'Tambahkan aset pertama untuk mulai memantau estimasi nilainya.'
                        }
                        action={
                            hasFilter ? (
                                <ButtonLink href={index.url()} variant="ghost">
                                    Reset filter
                                </ButtonLink>
                            ) : (
                                <ButtonLink href={create.url()}>
                                    <Plus className="h-4 w-4" />
                                    Tambah aset
                                </ButtonLink>
                            )
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
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

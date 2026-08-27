import { Head, router, usePage } from '@inertiajs/react';
import {
    Archive,
    CalendarDays,
    CircleDollarSign,
    Coins,
    Package,
    Pencil,
} from 'lucide-react';
import { useState } from 'react';

import SummaryCard from '@/components/dashboard/summary-card';
import { StatusMessage } from '@/components/form-controls';
import Badge from '@/components/ui/badge';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import AppLayout from '@/layouts/app-layout';
import { assetTypeLabels } from '@/lib/finance-labels';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { archive, edit, index } from '@/routes/assets';
import type { AssetListItem, AssetPermissions } from '@/types';

export default function AssetShow({
    asset,
    permissions,
}: {
    asset: AssetListItem;
    permissions: AssetPermissions;
}) {
    const { flash } = usePage().props;
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const differencePositive = (asset.estimated_difference ?? 0) >= 0;

    const archiveAsset = () => {
        router.patch(
            archive.url(asset.id),
            {},
            {
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => setArchiveOpen(false),
            },
        );
    };

    return (
        <AppLayout
            title={asset.name}
            description="Detail aset dan estimasi nilai terakhir."
            breadcrumbs={[
                { label: 'Kekayaan' },
                { label: 'Aset', href: index.url() },
                { label: asset.name },
            ]}
            currentPath={index.url()}
            headerActions={
                permissions.canEdit || permissions.canArchive ? (
                    <div className="flex items-center gap-2">
                        {permissions.canEdit && (
                            <ButtonLink
                                href={edit.url(asset.id)}
                                variant="outline"
                                size="sm"
                            >
                                <Pencil className="h-4 w-4" />
                                <span className="hidden sm:inline">Ubah</span>
                            </ButtonLink>
                        )}
                        {permissions.canArchive && (
                            <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => setArchiveOpen(true)}
                            >
                                <Archive className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Arsipkan
                                </span>
                            </Button>
                        )}
                    </div>
                ) : undefined
            }
        >
            <Head title={asset.name} />

            <div className="mx-auto grid max-w-5xl gap-5">
                <StatusMessage message={flash.status} />

                <Card variant="navbar">
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                                <Package className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-medium text-foreground">
                                        {asset.name}
                                    </h2>
                                    <Badge
                                        variant={
                                            asset.status === 'active'
                                                ? 'success'
                                                : 'muted'
                                        }
                                    >
                                        {asset.status === 'active'
                                            ? 'Aktif'
                                            : 'Diarsipkan'}
                                    </Badge>
                                </div>
                                <p className="mt-1 text-sm font-light text-muted-foreground">
                                    {assetTypeLabels[asset.asset_type]}
                                </p>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-xs font-light text-muted-foreground">
                                Terakhir dinilai
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                                {formatDate(asset.valued_on)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Nilai Saat Ini"
                        value={formatRupiah(asset.current_value)}
                        comparison={`Dinilai ${formatDate(asset.valued_on)}`}
                        icon={
                            <CircleDollarSign className="h-5 w-5 text-primary" />
                        }
                        iconBg="bg-primary-soft"
                    />
                    <SummaryCard
                        title="Nilai Perolehan"
                        value={
                            asset.acquisition_cost === null
                                ? 'Tidak dicatat'
                                : formatRupiah(asset.acquisition_cost)
                        }
                        comparison={
                            asset.acquired_on
                                ? `Diperoleh ${formatDate(asset.acquired_on)}`
                                : 'Tanggal perolehan tidak dicatat'
                        }
                        icon={<Coins className="h-5 w-5 text-accent" />}
                        iconBg="bg-accent-soft"
                    />
                    <SummaryCard
                        title="Selisih Estimasi"
                        value={
                            asset.estimated_difference === null
                                ? 'Tidak tersedia'
                                : formatRupiah(asset.estimated_difference)
                        }
                        comparison="Nilai kini dikurangi nilai perolehan"
                        icon={
                            <CircleDollarSign
                                className={`h-5 w-5 ${differencePositive ? 'text-success' : 'text-danger'}`}
                            />
                        }
                        iconBg={
                            differencePositive
                                ? 'bg-success/10'
                                : 'bg-danger/10'
                        }
                    />
                    <SummaryCard
                        title="Tanggal Perolehan"
                        value={
                            asset.acquired_on
                                ? formatDate(asset.acquired_on)
                                : 'Tidak dicatat'
                        }
                        comparison="Informasi opsional"
                        icon={<CalendarDays className="h-5 w-5 text-warning" />}
                        iconBg="bg-warning/10"
                    />
                </div>

                <Card variant="navbar">
                    <CardContent className="grid gap-4 p-5 sm:p-6">
                        <div>
                            <h2 className="text-base font-medium text-foreground">
                                Catatan aset
                            </h2>
                            <p className="mt-1 text-xs font-light text-muted-foreground">
                                Kondisi atau sumber estimasi nilai terakhir.
                            </p>
                        </div>
                        <p className="rounded-2xl border border-border bg-background/55 p-4 text-sm leading-6 font-light text-foreground-secondary">
                            {asset.note ?? 'Tidak ada catatan untuk aset ini.'}
                        </p>
                        <p className="rounded-2xl bg-warning/10 px-4 py-3 text-xs leading-5 font-light text-warning">
                            Aset belum mempunyai histori valuasi. Setiap
                            perubahan nilai akan mengganti estimasi sebelumnya.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <ConfirmationDialog
                open={archiveOpen}
                title="Arsipkan aset?"
                description={`Aset “${asset.name}” tetap tersimpan, tetapi tidak lagi dihitung dalam ringkasan aset aktif.`}
                processing={processing}
                onCancel={() => setArchiveOpen(false)}
                onConfirm={archiveAsset}
            />
        </AppLayout>
    );
}

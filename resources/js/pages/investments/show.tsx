import { Head, router, usePage } from '@inertiajs/react';
import {
    Archive,
    CalendarDays,
    CircleDollarSign,
    Coins,
    Pencil,
    Plus,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

import SummaryCard from '@/components/dashboard/summary-card';
import { StatusMessage } from '@/components/form-controls';
import InvestmentValuationCard from '@/components/investments/investment-valuation-card';
import InvestmentValuationForm from '@/components/investments/investment-valuation-form';
import InvestmentValueChart from '@/components/investments/investment-value-chart';
import Badge from '@/components/ui/badge';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { investmentInstrumentLabels } from '@/lib/finance-labels';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { voidMethod as voidValuation } from '@/routes/investment-valuations';
import { archive, edit, index } from '@/routes/investments';
import type {
    InvestmentChartPoint,
    InvestmentListItem,
    InvestmentPermissions,
    InvestmentValuation,
    PaginatedData,
} from '@/types';

type InvestmentShowProps = {
    investment: InvestmentListItem;
    valuations: PaginatedData<InvestmentValuation>;
    chart: InvestmentChartPoint[];
    permissions: InvestmentPermissions;
    defaultValuedOn: string;
};

export default function InvestmentShow({
    investment,
    valuations,
    chart,
    permissions,
    defaultValuedOn,
}: InvestmentShowProps) {
    const { flash } = usePage().props;
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [valuationToVoid, setValuationToVoid] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const hasGain = (investment.profit_loss ?? 0) >= 0;

    const archiveInvestment = () => {
        router.patch(
            archive.url(investment.id),
            {},
            {
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => setArchiveOpen(false),
            },
        );
    };

    const voidSelectedValuation = () => {
        if (!valuationToVoid) {
            return;
        }

        router.patch(
            voidValuation.url(valuationToVoid),
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => setValuationToVoid(null),
            },
        );
    };

    return (
        <AppLayout
            title={investment.name}
            description="Detail holding, performa, dan histori valuasi investasi."
            breadcrumbs={[
                { label: 'Kekayaan' },
                { label: 'Investasi', href: index.url() },
                { label: investment.name },
            ]}
            currentPath={index.url()}
            headerActions={
                permissions.canEdit || permissions.canArchive ? (
                    <div className="flex items-center gap-2">
                        {permissions.canEdit && (
                            <ButtonLink
                                href={edit.url(investment.id)}
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
            <Head title={investment.name} />

            <div className="grid w-full gap-5">
                <StatusMessage message={flash.status} />

                <Card variant="navbar">
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                        <div className="flex min-w-0 items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-medium text-foreground">
                                        {investment.name}
                                    </h2>
                                    <Badge
                                        variant={
                                            investment.status === 'active'
                                                ? 'success'
                                                : 'muted'
                                        }
                                    >
                                        {investment.status === 'active'
                                            ? 'Aktif'
                                            : 'Diarsipkan'}
                                    </Badge>
                                </div>
                                <p className="mt-1 text-sm font-light text-muted-foreground">
                                    {
                                        investmentInstrumentLabels[
                                            investment.instrument_type
                                        ]
                                    }
                                    {investment.units
                                        ? ` · ${investment.units} unit`
                                        : ''}
                                </p>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-xs font-light text-muted-foreground">
                                Valuasi terakhir
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                                {investment.last_valuation_at
                                    ? formatDate(investment.last_valuation_at)
                                    : 'Belum dinilai'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Modal Perolehan"
                        value={formatRupiah(investment.acquisition_cost)}
                        comparison={`Diperoleh ${formatDate(investment.acquired_on)}`}
                        icon={<Coins className="h-5 w-5 text-accent" />}
                        iconBg="bg-accent-soft"
                    />
                    <SummaryCard
                        title="Nilai Terbaru"
                        value={
                            investment.current_value === null
                                ? 'Belum dinilai'
                                : formatRupiah(investment.current_value)
                        }
                        comparison="Valuasi aktif paling baru"
                        icon={<TrendingUp className="h-5 w-5 text-primary" />}
                        iconBg="bg-primary-soft"
                    />
                    <SummaryCard
                        title="Estimasi Untung/Rugi"
                        value={
                            investment.profit_loss === null
                                ? 'Belum tersedia'
                                : formatRupiah(investment.profit_loss)
                        }
                        comparison={
                            investment.profit_loss_percentage === null
                                ? 'Butuh data valuasi dan modal di atas nol'
                                : `${investment.profit_loss_percentage}% dari modal`
                        }
                        icon={
                            <CircleDollarSign
                                className={`h-5 w-5 ${hasGain ? 'text-success' : 'text-danger'}`}
                            />
                        }
                        iconBg={hasGain ? 'bg-success/10' : 'bg-danger/10'}
                    />
                    <SummaryCard
                        title="Jumlah Unit"
                        value={investment.units ?? 'Tidak dicatat'}
                        comparison="Maksimal delapan angka desimal"
                        icon={<CalendarDays className="h-5 w-5 text-warning" />}
                        iconBg="bg-warning/10"
                    />
                </div>

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
                    <Card variant="navbar">
                        <CardContent className="grid gap-4 p-5">
                            <div>
                                <h2 className="text-base font-medium text-foreground">
                                    Histori nilai
                                </h2>
                                <p className="mt-1 text-xs font-light text-muted-foreground">
                                    Grafik memakai maksimal 24 valuasi aktif
                                    terbaru.
                                </p>
                            </div>
                            <InvestmentValueChart points={chart} />
                        </CardContent>
                    </Card>

                    <Card variant="navbar">
                        <CardContent className="grid gap-4 p-5">
                            <div>
                                <h2 className="text-base font-medium text-foreground">
                                    Perbarui nilai
                                </h2>
                                <p className="mt-1 text-xs leading-5 font-light text-muted-foreground">
                                    Catat estimasi terbaru tanpa mengubah modal
                                    perolehan.
                                </p>
                            </div>
                            {permissions.canValue ? (
                                <InvestmentValuationForm
                                    investmentId={investment.id}
                                    defaultDate={defaultValuedOn}
                                />
                            ) : (
                                <p className="rounded-2xl border border-border bg-surface-muted/60 p-4 text-sm font-light text-muted-foreground">
                                    Investasi yang diarsipkan tidak menerima
                                    valuasi baru atau pembatalan histori.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4">
                    <div>
                        <h2 className="text-base font-medium text-foreground">
                            Riwayat valuasi
                        </h2>
                        <p className="mt-1 text-xs font-light text-muted-foreground">
                            Valuasi salah dibatalkan, bukan dihapus dari
                            histori.
                        </p>
                    </div>

                    {valuations.data.length === 0 ? (
                        <EmptyState
                            icon={<Plus className="h-7 w-7 text-primary" />}
                            title="Belum ada valuasi"
                            description="Catat valuasi pertama untuk mulai melihat performa investasi."
                        />
                    ) : (
                        <>
                            <div className="grid gap-3 md:grid-cols-2">
                                {valuations.data.map((valuation) => (
                                    <InvestmentValuationCard
                                        key={valuation.id}
                                        valuation={valuation}
                                        onVoid={
                                            permissions.canValue
                                                ? () =>
                                                      setValuationToVoid(
                                                          valuation.id,
                                                      )
                                                : undefined
                                        }
                                    />
                                ))}
                            </div>
                            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                                <p className="text-xs font-light text-muted-foreground">
                                    Menampilkan {valuations.from}–
                                    {valuations.to} dari {valuations.total}{' '}
                                    valuasi
                                </p>
                                <Pagination links={valuations.links} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ConfirmationDialog
                open={archiveOpen}
                title="Arsipkan investasi?"
                description={`Investasi “${investment.name}” tidak dapat diedit atau diberi valuasi baru, tetapi seluruh histori tetap tersimpan.`}
                processing={processing}
                onCancel={() => setArchiveOpen(false)}
                onConfirm={archiveInvestment}
            />
            <ConfirmationDialog
                open={valuationToVoid !== null}
                title="Batalkan valuasi?"
                description="Valuasi tetap tersimpan sebagai riwayat voided dan tanggal yang sama tidak dapat dipakai kembali."
                confirmLabel="Batalkan valuasi"
                processing={processing}
                onCancel={() => setValuationToVoid(null)}
                onConfirm={voidSelectedValuation}
            />
        </AppLayout>
    );
}

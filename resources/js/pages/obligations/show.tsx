import { Head, router, usePage } from '@inertiajs/react';
import {
    Archive,
    CalendarDays,
    CheckCircle2,
    HandCoins,
    Pencil,
    Plus,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

import SummaryCard from '@/components/dashboard/summary-card';
import { StatusMessage } from '@/components/form-controls';
import ObligationSettlementCard from '@/components/obligations/obligation-settlement-card';
import ObligationSettlementForm from '@/components/obligations/obligation-settlement-form';
import Badge from '@/components/ui/badge';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import Progress from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { archive, edit, index } from '@/routes/obligations';
import type {
    ObligationListItem,
    ObligationPermissions,
    ObligationSettlement,
    PaginatedData,
    SelectOption,
} from '@/types';

type Props = {
    obligation: ObligationListItem;
    settlements: PaginatedData<ObligationSettlement>;
    accountOptions: SelectOption[];
    permissions: ObligationPermissions;
    defaultSettlementDate: string;
    idempotencyKey: string;
};

export default function ObligationShow({
    obligation,
    settlements,
    accountOptions,
    permissions,
    defaultSettlementDate,
    idempotencyKey,
}: Props) {
    const { flash } = usePage().props;
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const kindLabel = obligation.kind === 'debt' ? 'Utang' : 'Piutang';
    const statusLabel =
        obligation.status === 'open'
            ? obligation.is_overdue
                ? 'Terlambat'
                : 'Berjalan'
            : obligation.status === 'settled'
              ? 'Lunas'
              : 'Diarsipkan';

    const archiveObligation = () => {
        router.patch(
            archive.url(obligation.id),
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
            title={obligation.counterparty_name}
            description={`Detail ${kindLabel.toLowerCase()} dan riwayat pembayarannya.`}
            breadcrumbs={[
                { label: 'Kekayaan' },
                { label: 'Utang & Piutang', href: index.url() },
                { label: obligation.counterparty_name },
            ]}
            currentPath={index.url()}
            headerActions={
                permissions.canEdit || permissions.canArchive ? (
                    <div className="flex items-center gap-2">
                        {permissions.canEdit && (
                            <ButtonLink
                                href={edit.url(obligation.id)}
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
            <Head title={obligation.counterparty_name} />

            <div className="grid w-full gap-5">
                <StatusMessage message={flash.status} />

                <Card variant="navbar">
                    <CardContent className="grid gap-5 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3.5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                                    <HandCoins className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-medium text-foreground">
                                            {obligation.counterparty_name}
                                        </h2>
                                        <Badge
                                            variant={
                                                obligation.is_overdue
                                                    ? 'danger'
                                                    : obligation.status ===
                                                        'settled'
                                                      ? 'success'
                                                      : obligation.status ===
                                                          'archived'
                                                        ? 'muted'
                                                        : 'default'
                                            }
                                        >
                                            {statusLabel}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-xs font-light text-muted-foreground">
                                        {kindLabel} dimulai{' '}
                                        {formatDate(obligation.started_on)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-xs font-light text-muted-foreground">
                                    Progres pelunasan
                                </p>
                                <p className="mt-1 text-2xl font-medium text-foreground">
                                    {obligation.progress_percentage}%
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Progress
                                value={obligation.paid_amount}
                                max={obligation.original_amount}
                            />
                            <div className="flex justify-between gap-3 text-xs font-light text-muted-foreground">
                                <span>
                                    {formatRupiah(obligation.paid_amount)}{' '}
                                    dibayar
                                </span>
                                <span>
                                    dari{' '}
                                    {formatRupiah(obligation.original_amount)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Nominal Awal"
                        value={formatRupiah(obligation.original_amount)}
                        comparison={`${kindLabel} tercatat`}
                        icon={<Wallet className="h-5 w-5 text-primary" />}
                        iconBg="bg-primary-soft"
                    />
                    <SummaryCard
                        title="Sudah Dibayar"
                        value={formatRupiah(obligation.paid_amount)}
                        comparison="Total riwayat pembayaran"
                        icon={<CheckCircle2 className="h-5 w-5 text-success" />}
                        iconBg="bg-success/10"
                    />
                    <SummaryCard
                        title="Sisa Outstanding"
                        value={formatRupiah(obligation.outstanding_amount)}
                        comparison="Nominal yang belum selesai"
                        icon={<HandCoins className="h-5 w-5 text-accent" />}
                        iconBg="bg-accent-soft"
                    />
                    <SummaryCard
                        title="Jatuh Tempo"
                        value={
                            obligation.due_on
                                ? formatDate(obligation.due_on)
                                : 'Tidak ditentukan'
                        }
                        comparison={
                            obligation.is_overdue
                                ? 'Sudah melewati jatuh tempo'
                                : 'Batas penyelesaian'
                        }
                        icon={<CalendarDays className="h-5 w-5 text-warning" />}
                        iconBg="bg-warning/10"
                    />
                </div>

                <Card variant="navbar">
                    <CardContent className="grid gap-3 p-5">
                        <h2 className="text-base font-medium text-foreground">
                            Catatan
                        </h2>
                        <p className="rounded-2xl border border-primary/10 bg-primary-soft/55 p-4 text-sm leading-6 font-light text-foreground-secondary dark:border-border dark:bg-background/55">
                            {obligation.note ??
                                'Tidak ada catatan untuk kewajiban ini.'}
                        </p>
                    </CardContent>
                </Card>

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <Card variant="navbar">
                        <CardContent className="grid gap-4 p-5">
                            <div>
                                <h2 className="text-base font-medium text-foreground">
                                    Catat pembayaran
                                </h2>
                                <p className="mt-1 text-xs leading-5 font-light text-muted-foreground">
                                    Nominal maksimal adalah sisa outstanding.
                                </p>
                            </div>
                            {permissions.canSettle ? (
                                accountOptions.length > 0 ? (
                                    <ObligationSettlementForm
                                        obligationId={obligation.id}
                                        kind={obligation.kind}
                                        outstandingAmount={
                                            obligation.outstanding_amount
                                        }
                                        accountOptions={accountOptions}
                                        defaultDate={defaultSettlementDate}
                                        idempotencyKey={idempotencyKey}
                                    />
                                ) : (
                                    <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm font-light text-warning">
                                        Buat akun keuangan aktif sebelum
                                        mencatat pembayaran.
                                    </div>
                                )
                            ) : (
                                <div className="rounded-2xl border border-border bg-surface-muted/60 p-4 text-sm font-light text-muted-foreground">
                                    Kewajiban ini sudah selesai dan tidak
                                    menerima pembayaran baru.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <div>
                            <h2 className="text-base font-medium text-foreground">
                                Riwayat pembayaran
                            </h2>
                            <p className="mt-1 text-xs font-light text-muted-foreground">
                                Setiap pembayaran terhubung ke transaksi akun.
                            </p>
                        </div>
                        {settlements.data.length === 0 ? (
                            <EmptyState
                                icon={<Plus className="h-7 w-7 text-primary" />}
                                title="Belum ada pembayaran"
                                description="Catat pembayaran pertama untuk mengurangi sisa outstanding."
                            />
                        ) : (
                            <>
                                <div className="grid gap-3">
                                    {settlements.data.map((settlement) => (
                                        <ObligationSettlementCard
                                            key={settlement.id}
                                            settlement={settlement}
                                        />
                                    ))}
                                </div>
                                <Pagination links={settlements.links} />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                open={archiveOpen}
                title="Arsipkan catatan?"
                description="Catatan lunas dan seluruh riwayat pembayarannya tetap tersimpan."
                processing={processing}
                onCancel={() => setArchiveOpen(false)}
                onConfirm={archiveObligation}
            />
        </AppLayout>
    );
}

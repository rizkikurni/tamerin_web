import { Head, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Ban,
    CalendarDays,
    CircleDollarSign,
    Clock3,
    FileText,
    Landmark,
    Tag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { StatusMessage } from '@/components/form-controls';
import {
    formatRupiah,
    formatTransactionDate,
    transactionTypeConfig,
    TransactionTypeIcon,
} from '@/components/transactions/transaction-display';
import VoidTransactionDialog from '@/components/transactions/void-transaction-dialog';
import Badge from '@/components/ui/badge';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { index } from '@/routes/transactions';
import type { TransactionDetail } from '@/types';

function formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date(value));
}

function DetailRow({
    icon: Icon,
    label,
    children,
}: {
    icon: LucideIcon;
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="flex gap-3 border-b border-border/70 py-3.5 last:border-b-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-light text-muted-foreground">
                    {label}
                </p>
                <div className="mt-1 text-sm text-foreground">{children}</div>
            </div>
        </div>
    );
}

export default function TransactionShow({
    transaction,
}: {
    transaction: TransactionDetail;
}) {
    const { flash } = usePage().props;
    const [showVoidDialog, setShowVoidDialog] = useState(false);
    const config = transactionTypeConfig[transaction.type];
    const isVoided = transaction.status === 'voided';
    const accountDescription = transaction.destination_account
        ? `${transaction.account.name} ke ${transaction.destination_account.name}`
        : transaction.account.name;

    return (
        <AppLayout
            title="Detail Transaksi"
            description="Informasi transaksi dan status pencatatannya."
            breadcrumbs={[
                { label: 'Keuangan' },
                { label: 'Transaksi', href: index.url() },
                { label: 'Detail' },
            ]}
            currentPath={index.url()}
        >
            <Head title="Detail Transaksi" />

            <div className="mx-auto grid max-w-4xl gap-4">
                <StatusMessage message={flash.status} />

                <Card variant="navbar">
                    <CardContent className="grid gap-5 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3.5">
                                <TransactionTypeIcon type={transaction.type} />
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-medium text-foreground">
                                            {config.label}
                                        </h2>
                                        <Badge
                                            variant={
                                                isVoided ? 'muted' : 'success'
                                            }
                                        >
                                            {isVoided
                                                ? 'Dibatalkan'
                                                : 'Tercatat'}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-xs font-light text-muted-foreground">
                                        {formatTransactionDate(
                                            transaction.transacted_on,
                                        )}
                                    </p>
                                </div>
                            </div>

                            <p
                                className={cn(
                                    'text-2xl font-medium tracking-tight',
                                    config.amountClass,
                                    isVoided && 'line-through opacity-70',
                                )}
                            >
                                {config.prefix}
                                {formatRupiah(transaction.amount)}
                            </p>
                        </div>

                        <div className="grid gap-x-8 md:grid-cols-2">
                            <div>
                                <DetailRow icon={CalendarDays} label="Tanggal">
                                    {formatTransactionDate(
                                        transaction.transacted_on,
                                    )}
                                </DetailRow>
                                <DetailRow icon={Landmark} label="Akun">
                                    {accountDescription}
                                </DetailRow>
                                <DetailRow icon={Tag} label="Kategori">
                                    {transaction.category?.name ??
                                        'Tidak menggunakan kategori'}
                                </DetailRow>
                            </div>
                            <div>
                                <DetailRow icon={FileText} label="Catatan">
                                    {transaction.note ?? 'Tidak ada catatan'}
                                </DetailRow>
                                <DetailRow
                                    icon={CircleDollarSign}
                                    label="Nominal"
                                >
                                    {formatRupiah(transaction.amount)}
                                </DetailRow>
                                <DetailRow icon={Clock3} label="Dicatat pada">
                                    {formatDateTime(transaction.created_at)}
                                </DetailRow>
                            </div>
                        </div>

                        {isVoided && (
                            <div className="rounded-2xl border border-danger/25 bg-danger/5 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                                        <Ban className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Transaksi dibatalkan
                                        </p>
                                        <p className="mt-1 text-sm leading-6 font-light text-muted-foreground">
                                            {transaction.void_reason}
                                        </p>
                                        {transaction.voided_at && (
                                            <p className="mt-2 text-xs font-light text-muted-foreground">
                                                {formatDateTime(
                                                    transaction.voided_at,
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-5 sm:flex-row sm:justify-between">
                            <ButtonLink
                                href={index.url()}
                                variant="outline"
                                size="sm"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Transaksi
                            </ButtonLink>

                            {transaction.can_void && (
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setShowVoidDialog(true)}
                                >
                                    <Ban className="h-4 w-4" />
                                    Batalkan Transaksi
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <VoidTransactionDialog
                open={showVoidDialog}
                transactionId={transaction.id}
                onClose={() => setShowVoidDialog(false)}
            />
        </AppLayout>
    );
}

import { Link } from '@inertiajs/react';
import { ChevronRight, Plus, ReceiptText } from 'lucide-react';

import {
    formatRupiah,
    formatTransactionDate,
    transactionTypeConfig,
    TransactionTypeIcon,
} from '@/components/transactions/transaction-display';
import Badge from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { create, show } from '@/routes/transactions';
import type { PaginatedData, TransactionListItem } from '@/types';

function accountLabel(transaction: TransactionListItem): string {
    if (transaction.destination_account) {
        return `${transaction.account.name} ke ${transaction.destination_account.name}`;
    }

    return transaction.account.name;
}

function amountLabel(transaction: TransactionListItem): string {
    const config = transactionTypeConfig[transaction.type];

    return `${config.prefix}${formatRupiah(transaction.amount)}`;
}

export default function TransactionList({
    transactions,
}: {
    transactions: PaginatedData<TransactionListItem>;
}) {
    if (transactions.data.length === 0) {
        return (
            <EmptyState
                icon={<ReceiptText className="h-7 w-7 text-primary" />}
                title="Belum ada transaksi"
                description="Catat transaksi pertama atau ubah filter yang sedang digunakan."
                action={
                    <ButtonLink href={create.url()} className="rounded-full">
                        <Plus className="h-4 w-4" />
                        Catat Transaksi
                    </ButtonLink>
                }
            />
        );
    }

    return (
        <div className="grid gap-4">
            <Card variant="navbar" className="hidden overflow-hidden md:block">
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                <th className="px-5 py-3 font-medium">
                                    Transaksi
                                </th>
                                <th className="px-4 py-3 font-medium">Akun</th>
                                <th className="px-4 py-3 font-medium">
                                    Tanggal
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Nominal
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Status
                                </th>
                                <th className="w-14 px-4 py-3">
                                    <span className="sr-only">Detail</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/70">
                            {transactions.data.map((transaction) => {
                                const config =
                                    transactionTypeConfig[transaction.type];
                                const isVoided =
                                    transaction.status === 'voided';

                                return (
                                    <tr
                                        key={transaction.id}
                                        className={cn(
                                            'transition-colors hover:bg-surface-muted/60',
                                            isVoided && 'opacity-65',
                                        )}
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <TransactionTypeIcon
                                                    type={transaction.type}
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {transaction.category
                                                            ?.name ??
                                                            config.label}
                                                    </p>
                                                    <p className="max-w-48 truncate text-xs font-light text-muted-foreground">
                                                        {transaction.note ??
                                                            config.label}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-foreground-secondary">
                                            {accountLabel(transaction)}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-foreground-secondary">
                                            {formatTransactionDate(
                                                transaction.transacted_on,
                                            )}
                                        </td>
                                        <td
                                            className={cn(
                                                'px-4 py-3.5 text-right text-sm font-medium',
                                                config.amountClass,
                                                isVoided && 'line-through',
                                            )}
                                        >
                                            {amountLabel(transaction)}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <Badge
                                                variant={
                                                    isVoided
                                                        ? 'muted'
                                                        : 'success'
                                                }
                                            >
                                                {isVoided
                                                    ? 'Dibatalkan'
                                                    : 'Tercatat'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <Link
                                                href={show.url(transaction.id)}
                                                aria-label="Lihat detail transaksi"
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary-soft hover:text-primary"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <div className="grid gap-3 md:hidden">
                {transactions.data.map((transaction) => {
                    const config = transactionTypeConfig[transaction.type];
                    const isVoided = transaction.status === 'voided';

                    return (
                        <Link
                            key={transaction.id}
                            href={show.url(transaction.id)}
                        >
                            <Card
                                variant="navbar"
                                className={cn(
                                    'transition-[background-color,border-color,box-shadow,opacity] duration-200',
                                    'hover:border-[var(--glass-border-strong)] hover:shadow-[var(--glass-shadow-hover)]',
                                    isVoided && 'opacity-65',
                                )}
                            >
                                <CardContent className="grid gap-3 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <TransactionTypeIcon
                                                type={transaction.type}
                                            />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {transaction.category
                                                        ?.name ?? config.label}
                                                </p>
                                                <p className="mt-0.5 truncate text-xs font-light text-muted-foreground">
                                                    {accountLabel(transaction)}
                                                </p>
                                            </div>
                                        </div>
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

                                    <div className="flex items-end justify-between gap-3 border-t border-border/70 pt-3">
                                        <p className="text-xs font-light text-muted-foreground">
                                            {formatTransactionDate(
                                                transaction.transacted_on,
                                            )}
                                        </p>
                                        <p
                                            className={cn(
                                                'text-sm font-medium',
                                                config.amountClass,
                                                isVoided && 'line-through',
                                            )}
                                        >
                                            {amountLabel(transaction)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs font-light text-muted-foreground">
                    Menampilkan {transactions.from}-{transactions.to} dari{' '}
                    {transactions.total} transaksi
                </p>
                <Pagination links={transactions.links} />
            </div>
        </div>
    );
}

import { Link } from '@inertiajs/react';
import { ChevronRight, Plus, ReceiptText } from 'lucide-react';
import { useMemo } from 'react';

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
        return `${transaction.account.name} → ${transaction.destination_account.name}`;
    }

    return transaction.account.name;
}

function amountLabel(transaction: TransactionListItem): string {
    const config = transactionTypeConfig[transaction.type];

    return `${config.prefix}${formatRupiah(transaction.amount)}`;
}

function toLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatGroupDateHeading(dateString: string): string {
    const now = new Date();
    const todayStr = toLocalIsoDate(now);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = toLocalIsoDate(yesterday);

    const formatted = new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${dateString}T00:00:00Z`));

    if (dateString === todayStr) {
        return `Hari ini · ${formatted}`;
    }

    if (dateString === yesterdayStr) {
        return `Kemarin · ${formatted}`;
    }

    return formatted;
}

type TransactionDateGroup = {
    date: string;
    heading: string;
    netAmount: number;
    hasCashFlow: boolean;
    items: TransactionListItem[];
};

export default function TransactionList({
    transactions,
}: {
    transactions: PaginatedData<TransactionListItem>;
}) {
    const groupedTransactions = useMemo<TransactionDateGroup[]>(() => {
        const groups = new Map<string, TransactionDateGroup>();

        for (const item of transactions.data) {
            const existing = groups.get(item.transacted_on);

            const signedCashFlow =
                item.status === 'posted'
                    ? item.type === 'income'
                        ? item.amount
                        : item.type === 'expense'
                          ? -item.amount
                          : 0
                    : 0;
            const isCashFlow =
                item.status === 'posted' &&
                (item.type === 'income' || item.type === 'expense');

            if (existing) {
                existing.items.push(item);
                existing.netAmount += signedCashFlow;
                existing.hasCashFlow = existing.hasCashFlow || isCashFlow;
            } else {
                groups.set(item.transacted_on, {
                    date: item.transacted_on,
                    heading: formatGroupDateHeading(item.transacted_on),
                    netAmount: signedCashFlow,
                    hasCashFlow: isCashFlow,
                    items: [item],
                });
            }
        }

        return Array.from(groups.values());
    }, [transactions.data]);

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
            <div className="grid gap-3">
                {groupedTransactions.map((group) => (
                    <Card
                        key={group.date}
                        variant="navbar"
                        className="overflow-hidden"
                    >
                        <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-background/40 px-4 py-2.5 sm:px-5">
                            <span className="text-xs font-medium text-foreground-secondary">
                                {group.heading}
                            </span>
                            {group.hasCashFlow && (
                                <span
                                    className={cn(
                                        'text-xs font-medium',
                                        group.netAmount > 0
                                            ? 'text-success'
                                            : group.netAmount < 0
                                              ? 'text-danger'
                                              : 'text-muted-foreground',
                                    )}
                                >
                                    {group.netAmount > 0 ? '+' : ''}
                                    {formatRupiah(group.netAmount)}
                                </span>
                            )}
                        </div>

                        <CardContent className="divide-y divide-border/60 p-0">
                            {group.items.map((transaction) => {
                                const config =
                                    transactionTypeConfig[transaction.type];
                                const isVoided =
                                    transaction.status === 'voided';
                                const title =
                                    transaction.category?.name ?? config.label;

                                return (
                                    <Link
                                        key={transaction.id}
                                        href={show.url(transaction.id)}
                                        aria-label={`Lihat detail transaksi ${title} pada ${formatTransactionDate(transaction.transacted_on)}`}
                                        className={cn(
                                            'group flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-surface-muted/70 sm:px-5',
                                            isVoided && 'opacity-65',
                                        )}
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <TransactionTypeIcon
                                                type={transaction.type}
                                                category={transaction.category}
                                            />

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                                                        {title}
                                                    </p>
                                                    {isVoided && (
                                                        <Badge variant="muted">
                                                            Dibatalkan
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-light text-muted-foreground">
                                                    <span className="font-normal text-foreground-secondary">
                                                        {accountLabel(
                                                            transaction,
                                                        )}
                                                    </span>
                                                    {transaction.note && (
                                                        <>
                                                            <span aria-hidden="true">
                                                                ·
                                                            </span>
                                                            <span className="max-w-xs truncate sm:max-w-md">
                                                                {
                                                                    transaction.note
                                                                }
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2.5">
                                            <div className="text-right">
                                                <p
                                                    className={cn(
                                                        'text-sm font-medium sm:text-base',
                                                        config.amountClass,
                                                        isVoided &&
                                                            'line-through',
                                                    )}
                                                >
                                                    {amountLabel(transaction)}
                                                </p>
                                                <p className="text-[11px] font-light text-muted-foreground">
                                                    {config.label}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs font-light text-muted-foreground">
                    Menampilkan {transactions.from}–{transactions.to} dari{' '}
                    {transactions.total} transaksi
                </p>
                <Pagination links={transactions.links} />
            </div>
        </div>
    );
}

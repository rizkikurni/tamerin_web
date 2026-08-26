import { Link } from '@inertiajs/react';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react';

import Badge from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
    index as transactionsIndex,
    show as showTransaction,
} from '@/routes/transactions';
import type { DashboardTransaction } from '@/types';

const typeConfig: Record<
    DashboardTransaction['type'],
    {
        icon: typeof ArrowDownLeft;
        iconClass: string;
        backgroundClass: string;
        prefix: string;
    }
> = {
    income: {
        icon: ArrowDownLeft,
        iconClass: 'text-success',
        backgroundClass: 'bg-success/10',
        prefix: '+',
    },
    expense: {
        icon: ArrowUpRight,
        iconClass: 'text-danger',
        backgroundClass: 'bg-danger/10',
        prefix: '−',
    },
    transfer: {
        icon: ArrowLeftRight,
        iconClass: 'text-primary',
        backgroundClass: 'bg-primary-soft',
        prefix: '',
    },
};

function amountClassName(type: DashboardTransaction['type']): string {
    return type === 'income'
        ? 'text-success'
        : type === 'expense'
          ? 'text-danger'
          : 'text-foreground';
}

export default function RecentTransactions({
    transactions,
}: {
    transactions: DashboardTransaction[];
}) {
    return (
        <Card variant="navbar">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-foreground">
                        Transaksi Terakhir
                    </h3>
                    <Link
                        href={transactionsIndex.url()}
                        className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                        Lihat semua
                    </Link>
                </div>
            </CardHeader>

            <CardContent>
                {transactions.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm font-light text-muted-foreground">
                        Belum ada transaksi untuk ditampilkan.
                    </p>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                        <th className="pb-2.5 font-medium">
                                            Tanggal
                                        </th>
                                        <th className="pb-2.5 font-medium">
                                            Kategori
                                        </th>
                                        <th className="pb-2.5 font-medium">
                                            Akun
                                        </th>
                                        <th className="pb-2.5 text-right font-medium">
                                            Nominal
                                        </th>
                                        <th className="pb-2.5 text-right font-medium">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {transactions.map((transaction) => {
                                        const config =
                                            typeConfig[transaction.type];
                                        const Icon = config.icon;

                                        return (
                                            <tr key={transaction.id}>
                                                <td className="py-3 text-sm text-muted-foreground">
                                                    {formatDate(
                                                        transaction.date,
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                        },
                                                    )}
                                                </td>
                                                <td className="py-3">
                                                    <Link
                                                        href={showTransaction.url(
                                                            transaction.id,
                                                        )}
                                                        className="flex items-center gap-2.5 hover:text-primary"
                                                    >
                                                        <span
                                                            className={cn(
                                                                'flex h-7 w-7 items-center justify-center rounded-lg',
                                                                config.backgroundClass,
                                                            )}
                                                        >
                                                            <Icon
                                                                className={cn(
                                                                    'h-3.5 w-3.5',
                                                                    config.iconClass,
                                                                )}
                                                            />
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {transaction.label}
                                                        </span>
                                                    </Link>
                                                </td>
                                                <td className="py-3 text-sm text-muted-foreground">
                                                    {transaction.account}
                                                </td>
                                                <td
                                                    className={cn(
                                                        'py-3 text-right text-sm font-medium',
                                                        amountClassName(
                                                            transaction.type,
                                                        ),
                                                    )}
                                                >
                                                    {config.prefix}
                                                    {formatRupiah(
                                                        transaction.amount,
                                                    )}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <Badge
                                                        variant={
                                                            transaction.status ===
                                                            'posted'
                                                                ? 'success'
                                                                : 'muted'
                                                        }
                                                    >
                                                        {transaction.status ===
                                                        'posted'
                                                            ? 'Aktif'
                                                            : 'Dibatalkan'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-2 md:hidden">
                            {transactions.map((transaction) => {
                                const config = typeConfig[transaction.type];
                                const Icon = config.icon;

                                return (
                                    <Link
                                        key={transaction.id}
                                        href={showTransaction.url(
                                            transaction.id,
                                        )}
                                        className="flex items-center justify-between gap-3 rounded-xl p-2 transition-colors hover:bg-surface-muted"
                                    >
                                        <span className="flex min-w-0 items-center gap-3">
                                            <span
                                                className={cn(
                                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                                                    config.backgroundClass,
                                                )}
                                            >
                                                <Icon
                                                    className={cn(
                                                        'h-4 w-4',
                                                        config.iconClass,
                                                    )}
                                                />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-medium text-foreground">
                                                    {transaction.label}
                                                </span>
                                                <span className="block text-xs font-light text-muted-foreground">
                                                    {formatDate(
                                                        transaction.date,
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                        },
                                                    )}{' '}
                                                    · {transaction.account}
                                                </span>
                                            </span>
                                        </span>
                                        <span
                                            className={cn(
                                                'shrink-0 text-sm font-medium',
                                                amountClassName(
                                                    transaction.type,
                                                ),
                                            )}
                                        >
                                            {config.prefix}
                                            {formatRupiah(transaction.amount)}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

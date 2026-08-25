import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react';

import Badge from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Dummy data — akan diganti di Fase 8
type TransactionType = 'income' | 'expense' | 'transfer';

interface Transaction {
    id: number;
    date: string;
    type: TransactionType;
    category: string;
    account: string;
    amount: number;
    status: 'completed' | 'pending';
}

const transactions: Transaction[] = [
    {
        id: 1,
        date: '22 Agt',
        type: 'income',
        category: 'Gaji',
        account: 'BCA',
        amount: 5000000,
        status: 'completed',
    },
    {
        id: 2,
        date: '21 Agt',
        type: 'expense',
        category: 'Makanan',
        account: 'GoPay',
        amount: 85000,
        status: 'completed',
    },
    {
        id: 3,
        date: '21 Agt',
        type: 'expense',
        category: 'Transportasi',
        account: 'OVO',
        amount: 35000,
        status: 'completed',
    },
    {
        id: 4,
        date: '20 Agt',
        type: 'transfer',
        category: 'Transfer',
        account: 'BCA → Mandiri',
        amount: 1000000,
        status: 'completed',
    },
    {
        id: 5,
        date: '20 Agt',
        type: 'expense',
        category: 'Belanja',
        account: 'Mandiri',
        amount: 250000,
        status: 'pending',
    },
    {
        id: 6,
        date: '19 Agt',
        type: 'income',
        category: 'Freelance',
        account: 'BCA',
        amount: 1500000,
        status: 'completed',
    },
    {
        id: 7,
        date: '19 Agt',
        type: 'expense',
        category: 'Tagihan',
        account: 'Mandiri',
        amount: 500000,
        status: 'completed',
    },
];

const typeConfig: Record<
    TransactionType,
    {
        icon: typeof ArrowDownLeft;
        iconClass: string;
        bgClass: string;
        prefix: string;
    }
> = {
    income: {
        icon: ArrowDownLeft,
        iconClass: 'text-success',
        bgClass: 'bg-success/10',
        prefix: '+',
    },
    expense: {
        icon: ArrowUpRight,
        iconClass: 'text-danger',
        bgClass: 'bg-danger/10',
        prefix: '−',
    },
    transfer: {
        icon: ArrowLeftRight,
        iconClass: 'text-primary',
        bgClass: 'bg-primary-soft',
        prefix: '',
    },
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export default function RecentTransactions() {
    return (
        <Card variant="navbar">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-foreground">
                        Transaksi Terakhir
                    </h3>
                    <a
                        href="/transactions"
                        className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                        Lihat semua
                    </a>
                </div>
            </CardHeader>

            <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                <th className="pb-2.5 font-medium">Tanggal</th>
                                <th className="pb-2.5 font-medium">Kategori</th>
                                <th className="pb-2.5 font-medium">Akun</th>
                                <th className="pb-2.5 text-right font-medium">
                                    Nominal
                                </th>
                                <th className="pb-2.5 text-right font-medium">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {transactions.map((tx) => {
                                const config = typeConfig[tx.type];
                                const Icon = config.icon;

                                return (
                                    <tr key={tx.id}>
                                        <td className="py-3 text-sm text-muted-foreground">
                                            {tx.date}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={cn(
                                                        'flex h-7 w-7 items-center justify-center rounded-lg',
                                                        config.bgClass,
                                                    )}
                                                >
                                                    <Icon
                                                        className={cn(
                                                            'h-3.5 w-3.5',
                                                            config.iconClass,
                                                        )}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-foreground">
                                                    {tx.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-sm text-muted-foreground">
                                            {tx.account}
                                        </td>
                                        <td
                                            className={cn(
                                                'py-3 text-right text-sm font-medium',
                                                tx.type === 'income'
                                                    ? 'text-success'
                                                    : tx.type === 'expense'
                                                      ? 'text-danger'
                                                      : 'text-foreground',
                                            )}
                                        >
                                            {config.prefix}
                                            {formatRupiah(tx.amount)}
                                        </td>
                                        <td className="py-3 text-right">
                                            <Badge
                                                variant={
                                                    tx.status === 'completed'
                                                        ? 'success'
                                                        : 'warning'
                                                }
                                            >
                                                {tx.status === 'completed'
                                                    ? 'Selesai'
                                                    : 'Tertunda'}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="space-y-3 md:hidden">
                    {transactions.map((tx) => {
                        const config = typeConfig[tx.type];
                        const Icon = config.icon;

                        return (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            'flex h-9 w-9 items-center justify-center rounded-xl',
                                            config.bgClass,
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'h-4 w-4',
                                                config.iconClass,
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {tx.category}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {tx.date} · {tx.account}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        tx.type === 'income'
                                            ? 'text-success'
                                            : tx.type === 'expense'
                                              ? 'text-danger'
                                              : 'text-foreground',
                                    )}
                                >
                                    {config.prefix}
                                    {formatRupiah(tx.amount)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

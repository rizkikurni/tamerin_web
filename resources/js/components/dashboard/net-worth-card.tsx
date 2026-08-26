import {
    ArrowDownLeft,
    ArrowUpRight,
    Landmark,
    Minus,
    TrendingUp,
    Wallet,
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { DashboardNetWorth } from '@/types';

export default function NetWorthCard({
    netWorth,
}: {
    netWorth: DashboardNetWorth;
}) {
    const components = [
        { label: 'Saldo akun', value: netWorth.accountBalance, icon: Wallet },
        { label: 'Investasi', value: netWorth.investments, icon: TrendingUp },
        { label: 'Aset', value: netWorth.assets, icon: Landmark },
        { label: 'Piutang', value: netWorth.receivables, icon: ArrowDownLeft },
        {
            label: 'Utang',
            value: netWorth.debts,
            icon: ArrowUpRight,
            negative: true,
        },
    ];

    return (
        <Card variant="navbar" className="h-full">
            <CardHeader>
                <h3 className="text-base font-medium text-foreground">
                    Kekayaan Bersih
                </h3>
                <p className="mt-2 text-2xl font-medium text-foreground">
                    {formatRupiah(netWorth.total)}
                </p>
                <p className="mt-0.5 text-xs font-light text-muted-foreground">
                    Diperbarui {formatDate(netWorth.updatedAt)}
                </p>
            </CardHeader>

            <CardContent className="space-y-2.5">
                {components.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.label}
                            className="flex items-center justify-between gap-3"
                        >
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-lg',
                                        item.negative
                                            ? 'bg-danger/10 text-danger'
                                            : 'bg-primary-soft text-primary',
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm text-foreground-secondary">
                                    {item.label}
                                </span>
                            </div>
                            <span
                                className={cn(
                                    'flex items-center text-sm font-medium',
                                    item.negative
                                        ? 'text-danger'
                                        : 'text-foreground',
                                )}
                            >
                                {item.negative && <Minus className="h-3 w-3" />}
                                {formatRupiah(item.value)}
                            </span>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

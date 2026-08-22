import {
    ArrowDownLeft,
    ArrowUpRight,
    Landmark,
    Minus,
    TrendingUp,
    Wallet,
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Dummy data — akan diganti di Fase 8
const netWorthData = {
    total: 45800000,
    lastUpdated: '22 Agustus 2026',
    components: [
        {
            label: 'Saldo Akun',
            value: 12500000,
            icon: Wallet,
            type: 'positive' as const,
        },
        {
            label: 'Investasi',
            value: 25000000,
            icon: TrendingUp,
            type: 'positive' as const,
        },
        {
            label: 'Aset',
            value: 15000000,
            icon: Landmark,
            type: 'positive' as const,
        },
        {
            label: 'Piutang',
            value: 3300000,
            icon: ArrowDownLeft,
            type: 'positive' as const,
        },
        {
            label: 'Utang',
            value: -10000000,
            icon: ArrowUpRight,
            type: 'negative' as const,
        },
    ],
};

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.abs(value));
}

export default function NetWorthCard() {
    return (
        <Card>
            <CardHeader>
                <h3 className="text-base font-semibold text-foreground">
                    Kekayaan Bersih
                </h3>
                <p className="mt-2 text-2xl font-bold text-foreground">
                    {formatRupiah(netWorthData.total)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Diperbarui {netWorthData.lastUpdated}
                </p>
            </CardHeader>

            <CardContent className="space-y-2.5">
                {netWorthData.components.map((item) => {
                    const Icon = item.icon;
                    const isNegative = item.type === 'negative';

                    return (
                        <div
                            key={item.label}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-lg',
                                        isNegative
                                            ? 'bg-danger/10'
                                            : 'bg-primary-soft',
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'h-4 w-4',
                                            isNegative
                                                ? 'text-danger'
                                                : 'text-primary',
                                        )}
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 text-sm text-foreground-secondary">
                                    {isNegative && (
                                        <Minus className="h-3 w-3 text-danger" />
                                    )}
                                    {item.label}
                                </div>
                            </div>

                            <span
                                className={cn(
                                    'text-sm font-medium',
                                    isNegative
                                        ? 'text-danger'
                                        : 'text-foreground',
                                )}
                            >
                                {isNegative ? '−' : ''}
                                {formatRupiah(item.value)}
                            </span>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

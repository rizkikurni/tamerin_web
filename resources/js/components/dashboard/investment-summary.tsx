import { TrendingDown, TrendingUp } from 'lucide-react';

import Badge from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Dummy data — akan diganti di Fase 8
interface Investment {
    name: string;
    type: string;
    value: number;
    change: number;
}

const investments: Investment[] = [
    {
        name: 'BBCA',
        type: 'Saham',
        value: 12500000,
        change: 3.2,
    },
    {
        name: 'Reksadana Equity',
        type: 'Reksadana',
        value: 8000000,
        change: -1.5,
    },
    {
        name: 'SBN SR020',
        type: 'Obligasi',
        value: 4500000,
        change: 0.8,
    },
];

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export default function InvestmentSummary() {
    const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);

    return (
        <Card variant="glass">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">
                        Investasi
                    </h3>
                    <a
                        href="/investments"
                        className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                        Lihat semua
                    </a>
                </div>
                <p className="mt-1 text-lg font-semibold text-foreground">
                    {formatRupiah(totalValue)}
                </p>
            </CardHeader>

            <CardContent className="space-y-3">
                {investments.map((inv) => {
                    const isPositive = inv.change >= 0;

                    return (
                        <div
                            key={inv.name}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        'flex h-9 w-9 items-center justify-center rounded-xl',
                                        isPositive
                                            ? 'bg-success/10'
                                            : 'bg-danger/10',
                                    )}
                                >
                                    {isPositive ? (
                                        <TrendingUp className="h-4 w-4 text-success" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-danger" />
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {inv.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {inv.type}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-sm font-medium text-foreground">
                                    {formatRupiah(inv.value)}
                                </p>
                                <Badge
                                    variant={isPositive ? 'success' : 'danger'}
                                >
                                    {isPositive ? '+' : ''}
                                    {inv.change}%
                                </Badge>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

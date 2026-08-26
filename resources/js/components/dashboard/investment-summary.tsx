import { TrendingDown, TrendingUp } from 'lucide-react';

import Badge from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { DashboardInvestment } from '@/types';

export default function InvestmentSummary({
    investment,
}: {
    investment: DashboardInvestment | null;
}) {
    const isPositive = (investment?.change ?? 0) >= 0;

    return (
        <Card variant="navbar" className="h-full">
            <CardHeader>
                <h3 className="text-base font-medium text-foreground">
                    Investasi
                </h3>
                <p className="mt-0.5 text-xs font-light text-muted-foreground">
                    Valuasi portofolio yang perlu diperhatikan
                </p>
            </CardHeader>
            <CardContent>
                {investment === null ? (
                    <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm font-light text-muted-foreground">
                        Belum ada investasi aktif.
                    </p>
                ) : (
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 p-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <div
                                className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                                    isPositive
                                        ? 'bg-success/10 text-success'
                                        : 'bg-danger/10 text-danger',
                                )}
                            >
                                {isPositive ? (
                                    <TrendingUp className="h-5 w-5" />
                                ) : (
                                    <TrendingDown className="h-5 w-5" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {investment.name}
                                </p>
                                <p className="text-xs font-light text-muted-foreground">
                                    {investment.type}
                                    {investment.valuedOn
                                        ? ` · ${formatDate(investment.valuedOn)}`
                                        : ' · Belum dinilai'}
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-sm font-medium text-foreground">
                                {formatRupiah(investment.value)}
                            </p>
                            {investment.change !== null && (
                                <Badge
                                    variant={isPositive ? 'success' : 'danger'}
                                >
                                    {isPositive ? '+' : ''}
                                    {investment.change}%
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

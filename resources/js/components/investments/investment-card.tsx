import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronRight,
    CircleDollarSign,
    Plus,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';

import Badge from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { investmentInstrumentLabels } from '@/lib/finance-labels';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { show } from '@/routes/investments';
import type { InvestmentListItem } from '@/types';

export default function InvestmentCard({
    investment,
}: {
    investment: InvestmentListItem;
}) {
    const hasGain = (investment.profit_loss ?? 0) >= 0;
    const isStale =
        investment.status === 'active' &&
        (!investment.last_valuation_at ||
            new Date().getTime() -
                new Date(investment.last_valuation_at).getTime() >
                30 * 24 * 60 * 60 * 1000);

    return (
        <Card
            variant="navbar"
            className="group relative flex h-full flex-col justify-between transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--control-shadow-hover)]"
        >
            <CardContent className="grid gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <Link
                        href={show.url(investment.id)}
                        className="flex min-w-0 flex-1 items-center gap-3"
                    >
                        <div
                            className={cn(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105',
                                hasGain
                                    ? 'bg-success/15 text-success'
                                    : 'bg-primary-soft text-primary',
                            )}
                        >
                            {hasGain ? (
                                <TrendingUp className="h-5 w-5" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-danger" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
                                {investment.name}
                            </h2>
                            <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                {
                                    investmentInstrumentLabels[
                                        investment.instrument_type
                                    ]
                                }
                                {investment.units
                                    ? ` · ${investment.units} unit`
                                    : ''}
                            </p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-1.5">
                        {isStale && (
                            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">
                                Perlu update
                            </span>
                        )}
                        <Badge
                            variant={
                                investment.status === 'active'
                                    ? 'success'
                                    : 'muted'
                            }
                        >
                            {investment.status === 'active'
                                ? 'Aktif'
                                : 'Diarsipkan'}
                        </Badge>
                    </div>
                </div>

                {/* Modal vs Nilai Sekarang */}
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-primary/10 bg-primary-soft/45 p-3.5 dark:border-border dark:bg-background/45">
                    <div>
                        <p className="text-[11px] font-light text-muted-foreground">
                            Modal Perolehan
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                            {formatRupiah(investment.acquisition_cost)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[11px] font-light text-muted-foreground">
                            Nilai Terkini
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                            {investment.current_value === null
                                ? 'Belum dinilai'
                                : formatRupiah(investment.current_value)}
                        </p>
                    </div>
                </div>

                {/* Valuasi info & Profit/Loss */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-light text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {investment.last_valuation_at
                            ? formatDate(investment.last_valuation_at)
                            : 'Belum ada valuasi'}
                    </span>
                    {investment.profit_loss !== null && (
                        <span
                            className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                                hasGain
                                    ? 'bg-success/15 text-success'
                                    : 'bg-danger/15 text-danger',
                            )}
                        >
                            <CircleDollarSign className="h-3 w-3" />
                            {hasGain ? '+' : ''}
                            {formatRupiah(investment.profit_loss)}
                            {investment.profit_loss_percentage !== null
                                ? ` (${investment.profit_loss_percentage > 0 ? '+' : ''}${investment.profit_loss_percentage}%)`
                                : ''}
                        </span>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 border-t border-border/70 pt-3">
                    {investment.status === 'active' && (
                        <ButtonLink
                            href={show.url(investment.id)}
                            size="sm"
                            className="h-8 rounded-full px-3 text-xs"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Valuasi
                        </ButtonLink>
                    )}
                    <ButtonLink
                        href={show.url(investment.id)}
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full px-3 text-xs"
                    >
                        Detail
                        <ChevronRight className="h-3.5 w-3.5" />
                    </ButtonLink>
                </div>
            </CardContent>
        </Card>
    );
}

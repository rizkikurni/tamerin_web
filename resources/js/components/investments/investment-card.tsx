import { Link } from '@inertiajs/react';
import { CalendarDays, CircleDollarSign, TrendingUp } from 'lucide-react';

import Badge from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { investmentInstrumentLabels } from '@/lib/finance-labels';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { show } from '@/routes/investments';
import type { InvestmentListItem } from '@/types';

export default function InvestmentCard({
    investment,
}: {
    investment: InvestmentListItem;
}) {
    const hasGain = (investment.profit_loss ?? 0) >= 0;

    return (
        <Link href={show.url(investment.id)} className="group block">
            <Card
                variant="navbar"
                className="h-full transition-[transform,border-color,box-shadow] group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-[var(--control-shadow-hover)]"
            >
                <CardContent className="grid h-full gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="truncate text-base font-medium text-foreground">
                                    {investment.name}
                                </h2>
                                <p className="mt-1 text-xs font-light text-muted-foreground">
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
                        </div>
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

                    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-background/55 p-3.5">
                        <div>
                            <p className="text-xs font-light text-muted-foreground">
                                Modal
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                                {formatRupiah(investment.acquisition_cost)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-light text-muted-foreground">
                                Nilai terbaru
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                                {investment.current_value === null
                                    ? 'Belum dinilai'
                                    : formatRupiah(investment.current_value)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-1.5 font-light text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {investment.last_valuation_at
                                ? formatDate(investment.last_valuation_at)
                                : 'Belum ada valuasi'}
                        </span>
                        {investment.profit_loss !== null && (
                            <span
                                className={
                                    hasGain ? 'text-success' : 'text-danger'
                                }
                            >
                                <CircleDollarSign className="mr-1 inline h-3.5 w-3.5" />
                                {formatRupiah(investment.profit_loss)}
                                {investment.profit_loss_percentage !== null
                                    ? ` (${investment.profit_loss_percentage}%)`
                                    : ''}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

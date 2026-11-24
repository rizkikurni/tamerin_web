import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronRight,
    Plus,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';

import Badge from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Progress from '@/components/ui/progress';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { show } from '@/routes/obligations';
import type { ObligationListItem, ObligationStatus } from '@/types';

const statuses: Record<
    ObligationStatus,
    { label: string; variant: 'default' | 'success' | 'muted' }
> = {
    open: { label: 'Berjalan', variant: 'default' },
    settled: { label: 'Lunas', variant: 'success' },
    archived: { label: 'Diarsipkan', variant: 'muted' },
};

export default function ObligationCard({
    obligation,
}: {
    obligation: ObligationListItem;
}) {
    const status = statuses[obligation.status];
    const isDebt = obligation.kind === 'debt';
    const isSettled = obligation.status === 'settled';

    return (
        <Card
            variant="navbar"
            className="group relative flex h-full flex-col justify-between transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--control-shadow-hover)]"
        >
            <CardContent className="grid gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <Link
                        href={show.url(obligation.id)}
                        className="flex min-w-0 flex-1 items-center gap-3"
                    >
                        <div
                            className={cn(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105',
                                isDebt
                                    ? 'bg-danger/10 text-danger'
                                    : 'bg-success/15 text-success',
                            )}
                        >
                            {isDebt ? (
                                <TrendingDown className="h-5 w-5" />
                            ) : (
                                <TrendingUp className="h-5 w-5" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span
                                    className={cn(
                                        'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                                        isDebt
                                            ? 'bg-danger/15 text-danger'
                                            : 'bg-success/15 text-success',
                                    )}
                                >
                                    {isDebt ? 'Utang' : 'Piutang'}
                                </span>
                                <h2 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
                                    {obligation.counterparty_name}
                                </h2>
                            </div>
                            <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                Total {formatRupiah(obligation.original_amount)}
                            </p>
                        </div>
                    </Link>
                    <Badge
                        variant={
                            obligation.is_overdue ? 'danger' : status.variant
                        }
                    >
                        {obligation.is_overdue ? 'Terlambat' : status.label}
                    </Badge>
                </div>

                {/* Sisa outstanding box */}
                <div className="rounded-2xl border border-primary/10 bg-primary-soft/45 p-3.5 dark:border-border dark:bg-background/45">
                    <div className="flex items-baseline justify-between">
                        <p className="text-[11px] font-light text-muted-foreground">
                            Sisa Outstanding
                        </p>
                        <span className="text-xs font-semibold text-foreground">
                            {obligation.progress_percentage}% terbayar
                        </span>
                    </div>
                    <p className="mt-1 text-lg font-bold text-foreground">
                        {formatRupiah(obligation.outstanding_amount)}
                    </p>
                    <div className="mt-2.5 space-y-1">
                        <Progress
                            value={obligation.paid_amount}
                            max={obligation.original_amount}
                        />
                        <div className="flex justify-between text-[11px] font-light text-muted-foreground">
                            <span>
                                Terbayar {formatRupiah(obligation.paid_amount)}
                            </span>
                            <span>
                                dari {formatRupiah(obligation.original_amount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tanggal & Tempo */}
                <div className="flex items-center justify-between gap-3 text-xs font-light text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Mulai {formatDate(obligation.started_on)}
                    </span>
                    <span
                        className={cn(
                            obligation.is_overdue && 'font-medium text-danger',
                        )}
                    >
                        {obligation.due_on
                            ? `Tempo ${formatDate(obligation.due_on)}`
                            : 'Tanpa tempo'}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-border/70 pt-3">
                    {!isSettled && (
                        <ButtonLink
                            href={show.url(obligation.id)}
                            size="sm"
                            className="h-8 rounded-full px-3 text-xs"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            {isDebt ? 'Bayar' : 'Terima'}
                        </ButtonLink>
                    )}
                    <ButtonLink
                        href={show.url(obligation.id)}
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

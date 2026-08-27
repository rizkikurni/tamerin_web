import { Link } from '@inertiajs/react';
import { CalendarDays, HandCoins } from 'lucide-react';

import Badge from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Progress from '@/components/ui/progress';
import { formatDate, formatRupiah } from '@/lib/formatters';
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

    return (
        <Link href={show.url(obligation.id)} className="group block">
            <Card
                variant="navbar"
                className="h-full transition-[transform,border-color,box-shadow] group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-[var(--control-shadow-hover)]"
            >
                <CardContent className="grid h-full gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                                <HandCoins className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="truncate text-base font-medium text-foreground">
                                    {obligation.counterparty_name}
                                </h2>
                                <p className="mt-1 text-xs font-light text-muted-foreground">
                                    {obligation.kind === 'debt'
                                        ? 'Utang'
                                        : 'Piutang'}
                                </p>
                            </div>
                        </div>
                        <Badge
                            variant={
                                obligation.is_overdue
                                    ? 'danger'
                                    : status.variant
                            }
                        >
                            {obligation.is_overdue ? 'Terlambat' : status.label}
                        </Badge>
                    </div>

                    <div className="rounded-2xl border border-border bg-background/55 p-3.5">
                        <p className="text-xs font-light text-muted-foreground">
                            Sisa outstanding
                        </p>
                        <p className="mt-1 text-lg font-medium text-foreground">
                            {formatRupiah(obligation.outstanding_amount)}
                        </p>
                        <div className="mt-3 space-y-1.5">
                            <Progress
                                value={obligation.paid_amount}
                                max={obligation.original_amount}
                            />
                            <p className="text-xs font-light text-muted-foreground">
                                {obligation.progress_percentage}% selesai dari{' '}
                                {formatRupiah(obligation.original_amount)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs font-light text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Mulai {formatDate(obligation.started_on)}
                        </span>
                        <span>
                            {obligation.due_on
                                ? `Tempo ${formatDate(obligation.due_on)}`
                                : 'Tanpa jatuh tempo'}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

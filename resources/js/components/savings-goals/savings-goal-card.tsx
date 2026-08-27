import { CalendarDays, ChevronRight, Target } from 'lucide-react';

import Badge from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Progress from '@/components/ui/progress';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { show } from '@/routes/savings-goals';
import type { SavingsGoalListItem, SavingsGoalStatus } from '@/types';

const statusConfig: Record<
    SavingsGoalStatus,
    { label: string; variant: 'default' | 'success' | 'muted' }
> = {
    active: { label: 'Aktif', variant: 'default' },
    completed: { label: 'Selesai', variant: 'success' },
    archived: { label: 'Diarsipkan', variant: 'muted' },
};

export default function SavingsGoalCard({
    goal,
}: {
    goal: SavingsGoalListItem;
}) {
    const status = statusConfig[goal.status];

    return (
        <Card
            variant="navbar"
            className={cn(
                'transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:border-[var(--glass-border-strong)] hover:bg-surface/95 hover:shadow-[var(--glass-shadow-hover)]',
                goal.status === 'archived' && 'opacity-80',
            )}
        >
            <CardContent className="grid gap-4 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                            <Target className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-medium text-foreground">
                                {goal.name}
                            </h2>
                            <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                Target {formatRupiah(goal.target_amount)}
                            </p>
                        </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-background/40 p-3">
                    <div>
                        <p className="text-xs font-light text-muted-foreground">
                            Terkumpul
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                            {formatRupiah(goal.saved_amount)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-light text-muted-foreground">
                            Sisa
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                            {formatRupiah(goal.remaining_amount)}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Progress
                        value={goal.saved_amount}
                        max={goal.target_amount}
                    />
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-light text-muted-foreground">
                            {goal.target_date ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {formatDate(goal.target_date)}
                                </span>
                            ) : (
                                'Tanpa target tanggal'
                            )}
                        </span>
                        <span className="text-xs font-medium text-foreground-secondary">
                            {goal.percentage}%
                        </span>
                    </div>
                </div>

                <div className="flex justify-end border-t border-border/70 pt-4">
                    <ButtonLink
                        href={show.url(goal.id)}
                        variant="outline"
                        size="sm"
                    >
                        Lihat detail
                        <ChevronRight className="h-4 w-4" />
                    </ButtonLink>
                </div>
            </CardContent>
        </Card>
    );
}

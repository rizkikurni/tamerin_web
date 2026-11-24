import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Plus,
    Target,
} from 'lucide-react';

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
    const isCompleted = goal.status === 'completed';

    return (
        <Card
            variant="navbar"
            className={cn(
                'group relative transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface/95 hover:shadow-[var(--control-shadow-hover)]',
                goal.status === 'archived' && 'opacity-75',
            )}
        >
            <CardContent className="grid gap-4 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <Link
                        href={show.url(goal.id)}
                        className="flex min-w-0 flex-1 items-center gap-3"
                    >
                        <div
                            className={cn(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105',
                                isCompleted
                                    ? 'bg-success/15 text-success'
                                    : 'bg-primary-soft text-primary',
                            )}
                        >
                            {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5" />
                            ) : (
                                <Target className="h-5 w-5" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                                {goal.name}
                            </h2>
                            <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                Target {formatRupiah(goal.target_amount)}
                            </p>
                        </div>
                    </Link>
                    <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                {/* Terkumpul & Sisa Info Box */}
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-primary/10 bg-primary-soft/40 p-3 dark:border-border/70 dark:bg-background/40">
                    <div>
                        <p className="text-[11px] font-light text-muted-foreground">
                            Terkumpul
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {formatRupiah(goal.saved_amount)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-light text-muted-foreground">
                            {isCompleted ? 'Status' : 'Sisa Target'}
                        </p>
                        <p
                            className={cn(
                                'mt-0.5 text-sm font-semibold',
                                isCompleted
                                    ? 'text-success'
                                    : 'text-foreground',
                            )}
                        >
                            {isCompleted
                                ? 'Tercapai 🎉'
                                : formatRupiah(goal.remaining_amount)}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                    <Progress
                        value={goal.saved_amount}
                        max={goal.target_amount}
                    />
                    <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-light text-muted-foreground">
                            {goal.target_date ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {formatDate(goal.target_date)}
                                </span>
                            ) : (
                                'Tanpa tenggat waktu'
                            )}
                        </span>
                        <span
                            className={cn(
                                'font-semibold',
                                isCompleted
                                    ? 'text-success'
                                    : 'text-foreground-secondary',
                            )}
                        >
                            {goal.percentage}%
                        </span>
                    </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between border-t border-border/70 pt-3.5">
                    <span className="text-[11px] font-light text-muted-foreground">
                        {goal.status === 'active' &&
                            `${goal.percentage}% tercapai`}
                    </span>
                    <div className="flex items-center gap-2">
                        {goal.status === 'active' && (
                            <ButtonLink
                                href={show.url(goal.id)}
                                size="sm"
                                className="h-8 rounded-full px-3 text-xs"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Setor
                            </ButtonLink>
                        )}
                        <ButtonLink
                            href={show.url(goal.id)}
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full px-3 text-xs"
                        >
                            Detail
                            <ChevronRight className="h-3.5 w-3.5" />
                        </ButtonLink>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

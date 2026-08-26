import { PiggyBank } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Progress from '@/components/ui/progress';
import { formatDate, formatRupiah } from '@/lib/formatters';
import type { DashboardSavingsGoal } from '@/types';

export default function SavingsSummary({
    goal,
}: {
    goal: DashboardSavingsGoal | null;
}) {
    return (
        <Card variant="navbar" className="h-full">
            <CardHeader>
                <h3 className="text-base font-medium text-foreground">
                    Target Tabungan
                </h3>
                <p className="mt-0.5 text-xs font-light text-muted-foreground">
                    Target aktif terdekat
                </p>
            </CardHeader>
            <CardContent>
                {goal === null ? (
                    <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm font-light text-muted-foreground">
                        Belum ada target tabungan aktif.
                    </p>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
                                    <PiggyBank className="h-5 w-5 text-accent" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {goal.name}
                                    </p>
                                    <p className="text-xs font-light text-muted-foreground">
                                        {goal.targetDate
                                            ? `Target ${formatDate(goal.targetDate)}`
                                            : 'Tanpa batas waktu'}
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-foreground">
                                {goal.percentage}%
                            </span>
                        </div>
                        <Progress value={goal.current} max={goal.target} />
                        <div className="flex justify-between gap-3 text-xs font-light text-muted-foreground">
                            <span>{formatRupiah(goal.current)}</span>
                            <span>{formatRupiah(goal.target)}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

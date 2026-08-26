import Badge from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Progress from '@/components/ui/progress';
import { formatRupiah } from '@/lib/formatters';
import type { DashboardBudget } from '@/types';

const statusConfig: Record<
    DashboardBudget['status'],
    { label: string; variant: 'success' | 'warning' | 'danger' }
> = {
    safe: { label: 'Aman', variant: 'success' },
    warning: { label: 'Mendekati', variant: 'warning' },
    reached: { label: 'Tercapai', variant: 'warning' },
    over: { label: 'Melebihi', variant: 'danger' },
};

export default function BudgetProgress({
    budgets,
}: {
    budgets: DashboardBudget[];
}) {
    return (
        <Card variant="navbar" className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-medium text-foreground">
                        Budget
                    </h3>
                    <span className="text-xs font-light text-muted-foreground">
                        Bulan berjalan
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {budgets.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm font-light text-muted-foreground">
                        Belum ada budget pada periode ini.
                    </p>
                ) : (
                    budgets.map((budget) => {
                        const config = statusConfig[budget.status];

                        return (
                            <div key={budget.id} className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="truncate text-sm font-medium text-foreground">
                                        {budget.category}
                                    </span>
                                    <Badge variant={config.variant}>
                                        {config.label}
                                    </Badge>
                                </div>

                                <Progress
                                    value={budget.spent}
                                    max={budget.limit}
                                />

                                <div className="flex items-center justify-between gap-3 text-xs font-light text-muted-foreground">
                                    <span>
                                        {formatRupiah(budget.spent)} /{' '}
                                        {formatRupiah(budget.limit)}
                                    </span>
                                    <span className="shrink-0">
                                        {budget.remaining >= 0
                                            ? `Sisa ${formatRupiah(budget.remaining)}`
                                            : `Lebih ${formatRupiah(Math.abs(budget.remaining))}`}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}

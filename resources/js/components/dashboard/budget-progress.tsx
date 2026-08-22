import Badge from '@/components/ui/badge';
import Progress from '@/components/ui/progress';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Dummy data — akan diganti di Fase 8
const budgets = [
    {
        category: 'Makanan & Minuman',
        spent: 1200000,
        limit: 1500000,
    },
    {
        category: 'Transportasi',
        spent: 680000,
        limit: 800000,
    },
    {
        category: 'Hiburan',
        spent: 500000,
        limit: 500000,
    },
    {
        category: 'Belanja',
        spent: 1100000,
        limit: 1000000,
    },
    {
        category: 'Tagihan',
        spent: 400000,
        limit: 750000,
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

type BudgetStatus = 'safe' | 'warning' | 'reached' | 'over';

function getBudgetStatus(spent: number, limit: number): BudgetStatus {
    const percentage = (spent / limit) * 100;

    if (percentage > 100) return 'over';
    if (percentage >= 100) return 'reached';
    if (percentage >= 80) return 'warning';
    return 'safe';
}

const statusConfig: Record<
    BudgetStatus,
    { label: string; variant: 'success' | 'warning' | 'danger' | 'muted' }
> = {
    safe: { label: 'Aman', variant: 'success' },
    warning: { label: 'Mendekati', variant: 'warning' },
    reached: { label: 'Tercapai', variant: 'warning' },
    over: { label: 'Melebihi', variant: 'danger' },
};

export default function BudgetProgress() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">
                        Budget
                    </h3>
                    <a
                        href="/budgets"
                        className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                        Lihat semua
                    </a>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {budgets.map((budget) => {
                    const status = getBudgetStatus(budget.spent, budget.limit);
                    const config = statusConfig[status];
                    const remaining = budget.limit - budget.spent;

                    return (
                        <div key={budget.category} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">
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

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                    {formatRupiah(budget.spent)} /{' '}
                                    {formatRupiah(budget.limit)}
                                </span>
                                <span>
                                    {remaining >= 0
                                        ? `Sisa ${formatRupiah(remaining)}`
                                        : `Lebih ${formatRupiah(Math.abs(remaining))}`}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

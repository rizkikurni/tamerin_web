import { PiggyBank } from 'lucide-react';

import Progress from '@/components/ui/progress';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Dummy data — akan diganti di Fase 8
const savingsGoals = [
    {
        name: 'Dana Darurat',
        current: 8000000,
        target: 15000000,
        deadline: 'Des 2026',
    },
    {
        name: 'Liburan Bali',
        current: 3500000,
        target: 5000000,
        deadline: 'Okt 2026',
    },
    {
        name: 'MacBook Pro',
        current: 12000000,
        target: 25000000,
        deadline: 'Mar 2027',
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

export default function SavingsSummary() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">
                        Target Tabungan
                    </h3>
                    <a
                        href="/savings"
                        className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                        Lihat semua
                    </a>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {savingsGoals.map((goal) => {
                    const percentage = Math.round(
                        (goal.current / goal.target) * 100,
                    );

                    return (
                        <div key={goal.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft">
                                        <PiggyBank className="h-4 w-4 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {goal.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Target: {goal.deadline}
                                        </p>
                                    </div>
                                </div>

                                <span className="text-sm font-semibold text-foreground">
                                    {percentage}%
                                </span>
                            </div>

                            <Progress value={goal.current} max={goal.target} />

                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formatRupiah(goal.current)}</span>
                                <span>{formatRupiah(goal.target)}</span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

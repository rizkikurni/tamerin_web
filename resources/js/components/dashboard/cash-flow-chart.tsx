import { useState } from 'react';

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Dummy data — akan diganti di Fase 8
const dailyData = [
    { label: 'Sen', income: 800000, expense: 400000 },
    { label: 'Sel', income: 200000, expense: 600000 },
    { label: 'Rab', income: 1200000, expense: 350000 },
    { label: 'Kam', income: 150000, expense: 500000 },
    { label: 'Jum', income: 900000, expense: 700000 },
    { label: 'Sab', income: 400000, expense: 250000 },
    { label: 'Min', income: 300000, expense: 150000 },
];

const weeklyData = [
    { label: 'Mg 1', income: 2500000, expense: 1800000 },
    { label: 'Mg 2', income: 1800000, expense: 2100000 },
    { label: 'Mg 3', income: 3200000, expense: 1500000 },
    { label: 'Mg 4', income: 2000000, expense: 1900000 },
];

type Period = 'daily' | 'weekly';

function formatCompact(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}jt`;
    }

    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}rb`;
    }

    return value.toString();
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload) return null;

    return (
        <div className="rounded-xl border border-border bg-surface p-3 shadow-lg">
            <p className="mb-1.5 text-xs font-medium text-foreground">
                {label}
            </p>
            {payload.map((entry) => (
                <p
                    key={entry.name}
                    className="text-xs text-muted-foreground"
                >
                    <span
                        className="mr-1.5 inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    {entry.name === 'income' ? 'Pemasukan' : 'Pengeluaran'}:{' '}
                    <span className="font-medium text-foreground">
                        {formatRupiah(entry.value)}
                    </span>
                </p>
            ))}
        </div>
    );
}

export default function CashFlowChart() {
    const [period, setPeriod] = useState<Period>('daily');

    const data = period === 'daily' ? dailyData : weeklyData;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-foreground">
                            Arus Kas
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Pemasukan vs Pengeluaran
                        </p>
                    </div>

                    {/* Period Toggle */}
                    <div className="flex rounded-xl bg-surface-muted p-1">
                        {(['daily', 'weekly'] as const).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPeriod(p)}
                                className={cn(
                                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                                    period === p
                                        ? 'bg-surface text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {p === 'daily' ? 'Harian' : 'Mingguan'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        <span className="text-xs text-muted-foreground">
                            Pemasukan
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-danger" />
                        <span className="text-xs text-muted-foreground">
                            Pengeluaran
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            barGap={4}
                            margin={{ top: 8, right: 0, left: -16, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                tick={{
                                    fontSize: 12,
                                    fill: 'var(--muted-foreground)',
                                }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tickFormatter={formatCompact}
                                tick={{
                                    fontSize: 11,
                                    fill: 'var(--muted-foreground)',
                                }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="income"
                                fill="var(--primary)"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={32}
                            />
                            <Bar
                                dataKey="expense"
                                fill="var(--danger)"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={32}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

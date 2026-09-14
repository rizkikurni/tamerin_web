import { useMemo, useState } from 'react';
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
import { formatCompactRupiah, formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CashFlowPoint } from '@/types';

type View = 'daily' | 'weekly';

interface ChartPoint {
    label: string;
    income: number;
    expense: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload) {
        return null;
    }

    return (
        <div className="rounded-xl border border-[var(--glass-border-strong)] bg-surface/95 p-3 shadow-[var(--tooltip-shadow)] backdrop-blur-xl">
            <p className="mb-1.5 text-xs font-medium text-foreground">
                {label}
            </p>
            {payload.map((entry) => (
                <p key={entry.name} className="text-xs text-muted-foreground">
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

function toDailyData(data: CashFlowPoint[]): ChartPoint[] {
    return data.map((point) => ({
        label: new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            timeZone: 'UTC',
        }).format(new Date(`${point.date}T00:00:00Z`)),
        income: point.income,
        expense: point.expense,
    }));
}

function toWeeklyData(data: CashFlowPoint[]): ChartPoint[] {
    const groups = new Map<number, ChartPoint>();

    data.forEach((point) => {
        const day = Number(point.date.slice(-2));
        const week = Math.ceil(day / 7);
        const current = groups.get(week) ?? {
            label: `Minggu ${week}`,
            income: 0,
            expense: 0,
        };

        current.income += point.income;
        current.expense += point.expense;
        groups.set(week, current);
    });

    return Array.from(groups.values());
}

export default function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
    const [view, setView] = useState<View>('daily');
    const chartData = useMemo(
        () => (view === 'daily' ? toDailyData(data) : toWeeklyData(data)),
        [data, view],
    );
    const hasActivity = data.some(
        (point) => point.income > 0 || point.expense > 0,
    );

    return (
        <Card variant="navbar" className="h-full">
            <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-medium text-foreground">
                            Arus Kas
                        </h3>
                        <p className="mt-0.5 text-xs font-light text-muted-foreground">
                            Pemasukan dibanding pengeluaran
                        </p>
                    </div>
                    <div className="dashboard-chart-toggle flex rounded-xl bg-surface-muted p-1">
                        {(['daily', 'weekly'] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setView(option)}
                                className={cn(
                                    'dashboard-chart-toggle-option rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                                    view === option
                                        ? 'bg-surface text-foreground shadow-[var(--control-shadow)]'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {option === 'daily' ? 'Harian' : 'Mingguan'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        Pemasukan
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                        Pengeluaran
                    </span>
                </div>
            </CardHeader>

            <CardContent>
                {hasActivity ? (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                barGap={4}
                                margin={{
                                    top: 8,
                                    right: 0,
                                    left: -16,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    horizontal
                                    vertical
                                    stroke="var(--muted-foreground)"
                                    strokeDasharray="4 6"
                                    strokeOpacity={0.22}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{
                                        fontSize: 11,
                                        fill: 'var(--muted-foreground)',
                                    }}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={18}
                                />
                                <YAxis
                                    tickFormatter={formatCompactRupiah}
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
                ) : (
                    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border text-center">
                        <p className="max-w-xs text-sm font-light text-muted-foreground">
                            Belum ada arus kas pada periode ini.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

import { formatDate, formatRupiah } from '@/lib/formatters';
import type { InvestmentChartPoint } from '@/types';

export default function InvestmentValueChart({
    points,
}: {
    points: InvestmentChartPoint[];
}) {
    if (points.length === 0) {
        return (
            <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-background/45 px-5 text-center text-sm font-light text-muted-foreground">
                Grafik akan muncul setelah valuasi pertama dicatat.
            </div>
        );
    }

    const values = points.map((point) => point.value);
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const range = Math.max(maximum - minimum, 1);
    const polyline = points
        .map((point, index) => {
            const x =
                points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
            const y = 35 - ((point.value - minimum) / range) * 28;

            return `${x},${y}`;
        })
        .join(' ');

    return (
        <div className="grid gap-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-background/55 p-4">
                <svg
                    viewBox="0 0 100 40"
                    role="img"
                    aria-label="Grafik histori nilai investasi"
                    className="h-48 w-full overflow-visible text-primary"
                    preserveAspectRatio="none"
                >
                    <line
                        x1="0"
                        y1="35"
                        x2="100"
                        y2="35"
                        className="stroke-border"
                        strokeWidth="0.4"
                    />
                    <polyline
                        points={polyline}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs font-light text-muted-foreground">
                <span>{formatDate(points[0].valued_on)}</span>
                <span className="font-medium text-foreground">
                    {formatRupiah(points.at(-1)?.value ?? 0)}
                </span>
                <span>{formatDate(points.at(-1)?.valued_on ?? '')}</span>
            </div>
        </div>
    );
}

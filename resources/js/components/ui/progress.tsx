import { cn } from '@/lib/utils';

interface ProgressProps {
    value: number;
    max?: number;
    showValue?: boolean;
    className?: string;
}

export default function Progress({
    value,
    max = 100,
    showValue = false,
    className,
}: ProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={cn('space-y-2', className)}>
            <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>

            {showValue && (
                <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(0)}%
                </p>
            )}
        </div>
    );
}

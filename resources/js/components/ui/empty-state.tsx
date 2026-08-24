import { FolderOpen } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    steps?: string[];
    action?: ReactNode;
    className?: string;
}

export default function EmptyState({
    icon,
    title,
    description,
    steps,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center',
                'rounded-3xl border border-dashed border-border',
                'bg-surface px-6 py-12 text-center',
                className,
            )}
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted">
                {icon ?? (
                    <FolderOpen className="h-7 w-7 text-muted-foreground" />
                )}
            </div>

            <h3 className="mt-4 text-base font-medium text-foreground">
                {title}
            </h3>

            {description && (
                <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            )}

            {steps && steps.length > 0 && (
                <ol className="mt-4 space-y-1.5 text-left text-sm text-muted-foreground">
                    {steps.map((step, index) => (
                        <li key={step} className="flex items-start gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-medium text-primary">
                                {index + 1}
                            </span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
            )}

            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

// --- No Result State (filter kosong) ---

interface NoResultStateProps {
    title?: string;
    description?: string;
    onReset?: () => void;
    className?: string;
}

export function NoResultState({
    title = 'Tidak ada hasil',
    description = 'Coba ubah filter atau kata kunci pencarian.',
    onReset,
    className,
}: NoResultStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center',
                'rounded-3xl border border-dashed border-border',
                'bg-surface px-6 py-10 text-center',
                className,
            )}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted">
                <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="mt-3 text-sm font-medium text-foreground">
                {title}
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">{description}</p>

            {onReset && (
                <button
                    type="button"
                    onClick={onReset}
                    className="mt-3 rounded-xl bg-primary-soft px-3.5 py-2 text-xs font-medium text-primary transition-colors hover:opacity-90"
                >
                    Reset filter
                </button>
            )}
        </div>
    );
}

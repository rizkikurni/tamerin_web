import { AlertCircle, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    onRetry?: () => void;
    className?: string;
}

export default function ErrorState({
    title = 'Gagal memuat data',
    description = 'Terjadi kesalahan saat memuat data. Silakan coba lagi.',
    icon,
    onRetry,
    className,
}: ErrorStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center',
                'rounded-3xl border border-danger/20 bg-danger/5',
                'px-6 py-10 text-center',
                className,
            )}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10">
                {icon ?? (
                    <AlertCircle className="h-6 w-6 text-danger" />
                )}
            </div>

            <h3 className="mt-3 text-sm font-medium text-foreground">
                {title}
            </h3>

            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {description}
            </p>

            {onRetry && (
                <div className="mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Coba lagi
                    </Button>
                </div>
            )}
        </div>
    );
}

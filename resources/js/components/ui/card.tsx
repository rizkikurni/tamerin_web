import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface BaseProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function Card({ children, className, ...props }: BaseProps) {
    return (
        <div
            className={cn(
                'rounded-3xl',
                'border border-border',
                'bg-surface',
                'shadow-sm',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className, ...props }: BaseProps) {
    return (
        <div className={cn('p-5 pb-0', className)} {...props}>
            {children}
        </div>
    );
}

export function CardContent({ children, className, ...props }: BaseProps) {
    return (
        <div className={cn('p-5', className)} {...props}>
            {children}
        </div>
    );
}

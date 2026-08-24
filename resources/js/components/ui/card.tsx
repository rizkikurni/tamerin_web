import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

interface BaseProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-border bg-surface',
                'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
                'transition-colors duration-200',
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

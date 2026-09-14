import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: 'default' | 'navbar';
}

interface BaseProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function Card({
    children,
    className,
    variant = 'default',
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                'app-panel rounded-2xl border border-border bg-surface',
                'shadow-[var(--control-shadow)]',
                'transition-colors duration-200',
                variant === 'navbar' && [
                    'relative overflow-hidden rounded-[22px]',
                    'border-[var(--glass-border)] bg-surface/90 backdrop-blur-xl',
                    'shadow-[var(--glass-shadow)]',
                    'before:pointer-events-none before:absolute before:inset-0 before:rounded-[22px]',
                    'before:[background-image:var(--glass-gradient)]',
                    'after:pointer-events-none after:absolute after:inset-x-4 after:top-0 after:h-px after:bg-[var(--glass-highlight)]',
                ],
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
        <div className={cn('relative z-10 p-5 pb-0', className)} {...props}>
            {children}
        </div>
    );
}

export function CardContent({ children, className, ...props }: BaseProps) {
    return (
        <div className={cn('relative z-10 p-5', className)} {...props}>
            {children}
        </div>
    );
}

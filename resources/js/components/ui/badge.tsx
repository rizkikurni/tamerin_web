import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'muted';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode;
    variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-primary-soft text-primary',

    success: 'bg-success/10 text-success',

    warning: 'bg-warning/10 text-warning',

    danger: 'bg-danger/10 text-danger',

    muted: 'bg-surface-muted text-muted-foreground',
};

export default function Badge({
    children,
    variant = 'default',
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center',
                'rounded-full',
                'px-2.5 py-1',
                'text-xs font-medium',
                variantClasses[variant],
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}

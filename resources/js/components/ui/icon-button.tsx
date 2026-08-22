import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type IconButtonVariant = 'default' | 'ghost' | 'danger';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    label: string;
    variant?: IconButtonVariant;
}

const variantClasses: Record<IconButtonVariant, string> = {
    default:
        'border border-border bg-surface text-foreground hover:bg-surface-muted',

    ghost: 'bg-transparent text-foreground hover:bg-surface-muted',

    danger: 'bg-danger text-white hover:opacity-90',
};

export default function IconButton({
    icon,
    label,
    variant = 'default',
    className,
    ...props
}: IconButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={cn(
                'inline-flex h-10 w-10',
                'items-center justify-center',
                'rounded-full',
                'transition-all duration-200',
                variantClasses[variant],
                className,
            )}
            {...props}
        >
            {icon}
        </button>
    );
}

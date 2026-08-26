import { Link } from '@inertiajs/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'border border-primary/40 bg-primary text-primary-foreground shadow-[var(--brand-shadow)] hover:-translate-y-[1px] hover:brightness-105 hover:shadow-[var(--brand-shadow-hover)] active:translate-y-0',

    secondary: 'bg-primary-soft text-primary hover:opacity-90',

    outline:
        'border border-border bg-surface text-foreground hover:bg-surface-muted',

    ghost: 'bg-transparent text-foreground hover:bg-surface-muted',

    danger: 'bg-danger text-white hover:opacity-90',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
};

function buttonClassName(
    variant: ButtonVariant,
    size: ButtonSize,
    className?: string,
): string {
    return cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-xl font-medium',
        'transition-all duration-200',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-primary',
        'focus-visible:ring-offset-2',
        'focus-visible:ring-offset-background',
        'disabled:pointer-events-none',
        'disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
    );
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <button
            disabled={isDisabled}
            className={buttonClassName(variant, size, className)}
            {...props}
        >
            {loading ? 'Memproses...' : children}
        </button>
    );
}

interface ButtonLinkProps {
    href: string;
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
}

export function ButtonLink({
    href,
    children,
    variant = 'primary',
    size = 'md',
    className,
}: ButtonLinkProps) {
    return (
        <Link href={href} className={buttonClassName(variant, size, className)}>
            {children}
        </Link>
    );
}

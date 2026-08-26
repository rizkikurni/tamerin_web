import { Link } from '@inertiajs/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type IconButtonVariant = 'default' | 'ghost' | 'warning' | 'danger';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    label: string;
    variant?: IconButtonVariant;
}

const variantClasses: Record<IconButtonVariant, string> = {
    default:
        'border-[1.5px] border-border-strong/70 bg-background/80 text-muted-foreground shadow-[var(--control-shadow)] hover:border-[var(--glass-border-strong)] hover:border-x-primary/30 hover:bg-surface-muted/95 hover:[background-image:var(--control-gradient)] hover:text-primary hover:shadow-[var(--control-shadow-hover)]',

    ghost: 'bg-transparent text-muted-foreground hover:bg-surface-muted hover:text-foreground',

    warning:
        'border-[1.5px] border-border-strong/70 bg-background/80 text-muted-foreground shadow-[var(--control-shadow)] hover:border-[var(--glass-border-strong)] hover:border-x-warning/40 hover:bg-surface-muted/95 hover:[background-image:var(--control-gradient)] hover:text-warning hover:shadow-[var(--control-shadow-hover)]',

    danger: 'bg-danger text-white hover:opacity-90',
};

function iconButtonClassName(
    variant: IconButtonVariant,
    className?: string,
): string {
    return cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-[1px]',
        'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        className,
    );
}

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
            className={iconButtonClassName(variant, className)}
            {...props}
        >
            {icon}
        </button>
    );
}

interface IconLinkProps {
    href: string;
    icon: ReactNode;
    label: string;
    variant?: IconButtonVariant;
    className?: string;
}

export function IconLink({
    href,
    icon,
    label,
    variant = 'default',
    className,
}: IconLinkProps) {
    return (
        <Link
            href={href}
            aria-label={label}
            title={label}
            className={iconButtonClassName(variant, className)}
        >
            {icon}
        </Link>
    );
}

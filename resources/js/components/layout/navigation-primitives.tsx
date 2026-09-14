import type {
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    ReactNode,
} from 'react';

import BrandIcon from '@/components/brand-icon';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

import type { NavigationItem } from './navigation-config';

interface BrandLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    iconClassName?: string;
}

export function BrandLink({
    className,
    iconClassName,
    ...props
}: BrandLinkProps) {
    return (
        <a
            href={dashboard.url()}
            aria-label="Tamerin"
            className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full',
                'border-2 border-primary/30 bg-primary-soft text-primary',
                'shadow-[var(--brand-shadow)]',
                'transition-all duration-200 ease-out',
                'hover:-translate-y-[1px] hover:border-primary/50 hover:brightness-105',
                'hover:shadow-[var(--brand-shadow-hover)]',
                className,
            )}
            {...props}
        >
            <BrandIcon className={cn('h-6 w-6', iconClassName)} />
        </a>
    );
}

interface HeaderActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    label: string;
}

export function HeaderActionButton({
    icon,
    label,
    className,
    ...props
}: HeaderActionButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full',
                'border-[1.5px] border-x-2 border-border-strong/70',
                'border-x-border-strong/70 bg-background/80',
                'text-muted-foreground shadow-[var(--control-shadow)]',
                'transition-all duration-200',
                'hover:-translate-y-[1px] hover:border-[var(--glass-border-strong)]',
                'hover:border-x-primary/30 hover:text-foreground',
                'hover:bg-surface-muted/95 hover:[background-image:var(--control-gradient)]',
                'hover:shadow-[var(--control-shadow-hover)]',
                className,
            )}
            {...props}
        >
            {icon}
        </button>
    );
}

interface NavigationLinkProps {
    item: NavigationItem;
    active: boolean;
}

function getNavigationIconClass(active: boolean, className?: string): string {
    return cn(
        'group relative flex h-11 w-11 items-center justify-center',
        'rounded-full border-2 transition-all duration-200 ease-out',
        active
            ? [
                  '-translate-y-[1px] border-[var(--glass-border-strong)] border-x-primary/30',
                  'bg-surface-muted/95 [background-image:var(--control-gradient)]',
                  'text-primary',
                  'shadow-[var(--control-shadow-active)]',
              ]
            : [
                  'border-border-strong/70 bg-background/80',
                  'text-muted-foreground',
                  'shadow-[var(--control-shadow)]',
                  'hover:-translate-y-[1px] hover:border-[var(--glass-border-strong)]',
                  'hover:border-x-primary/30 hover:text-primary',
                  'hover:bg-surface-muted/95 hover:[background-image:var(--control-gradient)]',
                  'hover:shadow-[var(--control-shadow-hover)]',
              ],
        className,
    );
}

interface NavigationTooltipProps {
    label: string;
    placement: 'right' | 'top';
}

function NavigationTooltip({ label, placement }: NavigationTooltipProps) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'pointer-events-none absolute z-50 whitespace-nowrap',
                'rounded-xl border border-border-strong/60 bg-surface/95',
                'px-3 py-2 text-xs font-normal text-foreground',
                'opacity-0 shadow-[var(--tooltip-shadow)]',
                'backdrop-blur-xl transition-all duration-150',
                placement === 'right'
                    ? [
                          'top-1/2 left-full ml-3 translate-x-1 -translate-y-1/2',
                          'group-hover:translate-x-0 group-hover:opacity-100',
                          'group-focus-visible:translate-x-0 group-focus-visible:opacity-100',
                      ]
                    : [
                          'bottom-full left-1/2 mb-3 -translate-x-1/2 translate-y-1',
                          'group-hover:translate-y-0 group-hover:opacity-100',
                          'group-focus-visible:translate-y-0 group-focus-visible:opacity-100',
                      ],
            )}
        >
            {label}
        </span>
    );
}

export function HeaderNavigationLink({ item, active }: NavigationLinkProps) {
    const Icon = item.icon;

    return (
        <a
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full px-4',
                'border border-transparent text-sm font-normal',
                'transition-all duration-200',
                active
                    ? [
                          'relative -translate-y-[1px] overflow-hidden',
                          'border-x-2 border-[var(--glass-border-strong)] border-x-primary/30',
                          'bg-surface-muted/95 [background-image:var(--control-gradient)]',
                          'text-foreground',
                          'shadow-[var(--control-shadow-active)]',
                      ]
                    : [
                          'border-2 border-border-strong/70',
                          'bg-background/80 text-foreground',
                          'shadow-[var(--control-shadow)]',
                          'hover:-translate-y-[1px] hover:border-x-primary/30',
                          'hover:border-[var(--glass-border-strong)] hover:bg-surface-muted/95',
                          'hover:[background-image:var(--control-gradient)]',
                          'hover:shadow-[var(--control-shadow-hover)]',
                      ],
            )}
        >
            <Icon className="h-4 w-4" />
            {item.label}
        </a>
    );
}

export function SidebarNavigationLink({ item, active }: NavigationLinkProps) {
    const Icon = item.icon;

    return (
        <a
            href={item.href}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className={getNavigationIconClass(active)}
        >
            <Icon className="h-[18px] w-[18px]" />
            <NavigationTooltip label={item.label} placement="right" />
        </a>
    );
}

interface SidebarNavigationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    label: string;
    active: boolean;
    showTooltip?: boolean;
}

export function SidebarNavigationButton({
    icon,
    label,
    active,
    showTooltip = true,
    className,
    ...props
}: SidebarNavigationButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            className={getNavigationIconClass(active, className)}
            {...props}
        >
            {icon}
            {showTooltip && (
                <NavigationTooltip label={label} placement="right" />
            )}
        </button>
    );
}

export function MobileNavigationLink({ item, active }: NavigationLinkProps) {
    const Icon = item.icon;

    return (
        <a
            href={item.href}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className={getNavigationIconClass(active, 'justify-self-center')}
        >
            <Icon className="h-[18px] w-[18px]" />
            <NavigationTooltip label={item.label} placement="top" />
        </a>
    );
}

interface MobileMenuToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    openIcon: ReactNode;
    label: string;
    open: boolean;
}

export function MobileMenuToggle({
    icon,
    openIcon,
    label,
    open,
    className,
    ...props
}: MobileMenuToggleProps) {
    return (
        <button
            type="button"
            aria-label={label}
            aria-expanded={open}
            className={getNavigationIconClass(
                open,
                cn('justify-self-center', className),
            )}
            {...props}
        >
            {open ? openIcon : icon}
            <NavigationTooltip label={label} placement="top" />
        </button>
    );
}

interface MobilePrimaryActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    label: string;
}

export function MobilePrimaryAction({
    icon,
    label,
    className,
    ...props
}: MobilePrimaryActionProps) {
    return (
        <button
            type="button"
            aria-label={label}
            className={cn(
                'group relative flex h-14 w-14 -translate-y-3 items-center justify-center',
                'justify-self-center rounded-full border-2 border-primary/40',
                'bg-primary text-primary-foreground',
                'shadow-[var(--floating-action-shadow)]',
                'transition-all duration-200 ease-out',
                'hover:-translate-y-4 hover:border-primary/60',
                'hover:brightness-105',
                'hover:shadow-[var(--floating-action-shadow-hover)]',
                'active:-translate-y-2.5',
                'active:shadow-[var(--floating-action-shadow-active)]',
                className,
            )}
            {...props}
        >
            {icon}
            <NavigationTooltip label={label} placement="top" />
        </button>
    );
}

import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import {
    headerNavigationItems,
    isNavigationPathActive,
} from './navigation-config';
import {
    BrandLink,
    HeaderActionButton,
    HeaderNavigationLink,
} from './navigation-primitives';
import NotificationMenu from './notification-menu';
import UserMenu from './user-menu';

interface AppHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: { label: string; href?: string }[];
    children?: ReactNode;
    currentPath?: string;
    heading?: string;
}

export default function AppHeader({
    children,
    currentPath = '/dashboard',
    heading,
    title,
    description,
    breadcrumbs,
}: AppHeaderProps) {
    const contextLabel = heading
        ? title
        : (breadcrumbs?.[0]?.label ?? 'Tamerin');

    return (
        <header
            className={cn(
                'app-header sticky top-3 z-30 mx-4 mb-4 overflow-visible rounded-[22px]',
                'border border-[var(--glass-border)] bg-surface/90 backdrop-blur-xl',
                'shadow-[var(--glass-shadow)]',
                'transition-colors duration-200',
                'before:pointer-events-none before:absolute before:inset-0 before:rounded-[22px]',
                'before:[background-image:var(--glass-gradient)]',
                'after:pointer-events-none after:absolute after:inset-x-4',
                'after:top-0 after:h-px after:bg-[var(--glass-highlight)]',
            )}
        >
            <div className="app-responsive-header relative z-10 hidden min-h-16 grid-cols-1 gap-2.5 px-3 py-3 lg:flex lg:items-center lg:justify-between lg:gap-3 lg:px-4 lg:py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                    <BrandLink className="h-10 w-10 shrink-0 lg:hidden" />
                    <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                            <h1 className="truncate text-base font-medium text-foreground sm:text-lg">
                                <span className="sm:hidden">{title}</span>
                                <span className="hidden sm:inline">
                                    {heading ?? title}
                                </span>
                            </h1>
                            <span className="hidden shrink-0 rounded-full border border-[var(--glass-border-strong)] bg-surface/70 px-2.5 py-1 text-[9px] font-medium tracking-[0.12em] text-primary uppercase sm:inline-flex">
                                {contextLabel}
                            </span>
                        </div>
                        {description && (
                            <p className="mt-0.5 hidden truncate text-xs font-light text-muted-foreground sm:block">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex min-w-0 items-center justify-between gap-2 lg:ml-auto lg:justify-end">
                    {children && (
                        <div className="flex min-w-0 items-center">
                            {children}
                        </div>
                    )}

                    <div className="ml-auto flex shrink-0 items-center gap-2">
                        <HeaderActionButton
                            label="Cari"
                            icon={<Search className="h-[18px] w-[18px]" />}
                            className="app-navbar-control hidden h-10 w-10 sm:flex"
                        />
                        <NotificationMenu triggerClassName="app-navbar-control h-10 w-10" />
                        <UserMenu triggerClassName="h-10 w-10" />
                    </div>
                </div>
            </div>

            <div className="app-default-header relative z-10 mx-2 flex h-16 items-center justify-between gap-4">
                <div className="flex items-center">
                    <BrandLink className="lg:hidden" />

                    <nav className="hidden items-center gap-2 lg:flex">
                        {headerNavigationItems.map((item) => (
                            <HeaderNavigationLink
                                key={item.label}
                                item={item}
                                active={isNavigationPathActive(
                                    currentPath,
                                    item.href,
                                )}
                            />
                        ))}

                        <HeaderActionButton
                            label="Cari"
                            icon={<Search className="h-[18px] w-[18px]" />}
                            className="ml-1"
                        />
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    {children}
                    <NotificationMenu />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}

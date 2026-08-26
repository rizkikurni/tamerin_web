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
}

export default function AppHeader({
    children,
    currentPath = '/dashboard',
}: AppHeaderProps) {
    return (
        <header
            className={cn(
                'sticky top-3 z-30 mx-4 mb-4 overflow-visible rounded-[22px]',
                'border border-[var(--glass-border)] bg-surface/90 backdrop-blur-xl',
                'shadow-[var(--glass-shadow)]',
                'transition-colors duration-200',
                'before:pointer-events-none before:absolute before:inset-0 before:rounded-[22px]',
                'before:[background-image:var(--glass-gradient)]',
                'after:pointer-events-none after:absolute after:inset-x-4',
                'after:top-0 after:h-px after:bg-[var(--glass-highlight)]',
            )}
        >
            <div className="relative z-10 mx-2 flex h-16 items-center justify-between gap-4">
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

import { Bell, Search } from 'lucide-react';
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
import UserMenu from './user-menu';

interface AppHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: { label: string; href?: string }[];
    children?: ReactNode;
    currentPath?: string;
}

export default function AppHeader({
    currentPath = '/dashboard',
}: AppHeaderProps) {
    return (
        <header
            className={cn(
                'sticky top-3 z-30 mx-4 mb-4 overflow-visible rounded-[22px]',
                'border border-white/60 bg-surface/90 backdrop-blur-xl',
                'shadow-[0_8px_24px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.90),inset_0_-1px_0_rgba(15,23,42,0.03)]',
                'transition-colors duration-200',
                'before:pointer-events-none before:absolute before:inset-0 before:rounded-[22px]',
                'before:bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.18)_45%,rgba(15,23,42,0.025)_100%)]',
                'after:pointer-events-none after:absolute after:inset-x-4',
                'after:top-0 after:h-px after:bg-white/90',
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
                            className="ml-1 hover:shadow-[0_3px_8px_rgba(15,23,42,0.09)]"
                        />
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <HeaderActionButton
                        label="Notifikasi"
                        icon={<Bell className="h-[17px] w-[17px]" />}
                    />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}

import { cn } from '@/lib/utils';

import {
    isNavigationPathActive,
    sidebarNavigationGroups,
} from './navigation-config';
import { BrandLink, SidebarNavigationLink } from './navigation-primitives';
import SettingsSidebarMenu from './settings-sidebar-menu';

interface SidebarProps {
    currentPath?: string;
}

export default function Sidebar({ currentPath = '/dashboard' }: SidebarProps) {
    return (
        <aside
            className={cn(
                'app-sidebar sticky top-3 z-20 ml-3 hidden lg:flex',
                'h-[calc(100vh-24px)] w-[72px] flex-col items-center',
                'overflow-visible rounded-[22px] border border-[var(--glass-border)]',
                'bg-surface/90 py-3 backdrop-blur-xl',
                'shadow-[var(--glass-shadow)]',
            )}
        >
            <BrandLink className="sidebar-brand mb-5 rounded-[14px]" />

            <nav className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-2">
                {sidebarNavigationGroups.map((group, groupIndex) => (
                    <div key={group[0].label} className="w-full">
                        {groupIndex > 0 && (
                            <div className="sidebar-divider mx-2 my-2.5 h-px bg-border-strong/50" />
                        )}

                        <div className="flex flex-col items-center gap-1.5">
                            {group.map((item) => (
                                <SidebarNavigationLink
                                    key={item.label}
                                    item={item}
                                    active={isNavigationPathActive(
                                        currentPath,
                                        item.href,
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="mt-auto w-full px-2 pt-2">
                <div className="sidebar-divider mx-2 mb-2.5 h-px bg-border-strong/50" />

                <SettingsSidebarMenu currentPath={currentPath} />
            </div>
        </aside>
    );
}

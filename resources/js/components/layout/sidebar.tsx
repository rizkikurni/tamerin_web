import { cn } from '@/lib/utils';

import {
    isNavigationPathActive,
    sidebarFooterItems,
    sidebarNavigationGroups,
} from './navigation-config';
import { BrandLink, SidebarNavigationLink } from './navigation-primitives';

interface SidebarProps {
    currentPath?: string;
}

export default function Sidebar({ currentPath = '/dashboard' }: SidebarProps) {
    return (
        <aside
            className={cn(
                'sticky top-3 z-20 ml-3 hidden lg:flex',
                'h-[calc(100vh-24px)] w-[72px] flex-col items-center',
                'overflow-visible rounded-[22px] border border-white/60',
                'bg-surface/90 py-3 backdrop-blur-xl',
                'shadow-[0_8px_24px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.90),inset_0_-1px_0_rgba(15,23,42,0.03)]',
            )}
        >
            <BrandLink className="mb-5 rounded-[14px] shadow-[0_2px_5px_rgba(15,23,42,0.10)]" />

            <nav className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-2">
                {sidebarNavigationGroups.map((group, groupIndex) => (
                    <div key={group[0].label} className="w-full">
                        {groupIndex > 0 && (
                            <div className="mx-2 my-2.5 h-px bg-border-strong/50" />
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
                <div className="mx-2 mb-2.5 h-px bg-border-strong/50" />

                <div className="flex flex-col items-center gap-1">
                    {sidebarFooterItems.map((item) => (
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
        </aside>
    );
}

import { X } from 'lucide-react';
import { useState } from 'react';

import MobileMoreMenu from './mobile-more-menu';
import {
    isNavigationPathActive,
    mobileBottomNavigationItems,
} from './navigation-config';
import {
    MobileMenuToggle,
    MobileNavigationLink,
    MobilePrimaryAction,
} from './navigation-primitives';

interface MobileNavigationProps {
    currentPath?: string;
}

export default function MobileNavigation({
    currentPath = '/dashboard',
}: MobileNavigationProps) {
    const [moreOpen, setMoreOpen] = useState(false);

    return (
        <>
            <MobileMoreMenu
                currentPath={currentPath}
                open={moreOpen}
                onClose={() => setMoreOpen(false)}
            />

            <nav className="app-mobile-navigation fixed right-3 bottom-[calc(env(safe-area-inset-bottom)+12px)] left-3 z-50 h-16 rounded-[22px] border border-[var(--glass-border)] bg-surface/90 px-2 shadow-[var(--glass-shadow)] backdrop-blur-xl lg:hidden">
                <div className="grid h-full grid-cols-5 items-center">
                    {mobileBottomNavigationItems.map((navigationItem) => {
                        if (navigationItem.kind === 'action') {
                            const Icon = navigationItem.icon;

                            return (
                                <MobilePrimaryAction
                                    key={navigationItem.label}
                                    label={navigationItem.label}
                                    icon={<Icon className="h-7 w-7" />}
                                />
                            );
                        }

                        if (navigationItem.kind === 'menu') {
                            const Icon = navigationItem.icon;

                            return (
                                <MobileMenuToggle
                                    key={navigationItem.label}
                                    label={navigationItem.label}
                                    open={moreOpen}
                                    onClick={() =>
                                        setMoreOpen(
                                            (currentOpen) => !currentOpen,
                                        )
                                    }
                                    icon={
                                        <Icon className="h-[18px] w-[18px]" />
                                    }
                                    openIcon={
                                        <X className="h-[18px] w-[18px]" />
                                    }
                                />
                            );
                        }

                        return (
                            <MobileNavigationLink
                                key={navigationItem.item.label}
                                item={navigationItem.item}
                                active={isNavigationPathActive(
                                    currentPath,
                                    navigationItem.item.href,
                                )}
                            />
                        );
                    })}
                </div>
            </nav>
        </>
    );
}

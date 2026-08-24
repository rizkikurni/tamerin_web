import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

import {
    isNavigationPathActive,
    mobileMoreNavigationItems,
} from './navigation-config';
import type { NavigationItem } from './navigation-config';

interface MobileMoreMenuLinkProps {
    item: NavigationItem;
    active: boolean;
}

function MobileMoreMenuLink({ item, active }: MobileMoreMenuLinkProps) {
    const Icon = item.icon;

    return (
        <a
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'group flex min-h-[86px] flex-col items-center justify-center',
                'gap-2 rounded-[18px] border-[1.5px] px-2 py-3',
                'text-[11px] font-normal transition-all duration-200 ease-out',
                active
                    ? [
                          '-translate-y-[1px] border-white/80 text-primary',
                          'bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.92)_45%,rgba(235,238,242,0.82)_100%)]',
                          'shadow-[0_4px_10px_rgba(15,23,42,0.09)]',
                      ]
                    : [
                          'border-border-strong/60 bg-background/60',
                          'text-foreground-secondary',
                          'shadow-[0_1px_3px_rgba(15,23,42,0.035)]',
                          'hover:-translate-y-[1px] hover:border-primary/25',
                          'hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.92)_45%,rgba(235,238,242,0.82)_100%)]',
                          'hover:text-primary',
                          'hover:shadow-[0_4px_10px_rgba(15,23,42,0.08)]',
                      ],
            )}
        >
            <Icon className="h-6 w-6 transition-transform duration-200 group-hover:-translate-y-[1px]" />
            <span className="text-center leading-tight">{item.label}</span>
        </a>
    );
}

interface MobileMoreMenuProps {
    currentPath: string;
    open: boolean;
    onClose: () => void;
}

export default function MobileMoreMenu({
    currentPath,
    open,
    onClose,
}: MobileMoreMenuProps) {
    return (
        <>
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden',
                    'transition-all duration-300',
                    open
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0',
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className={cn(
                    'fixed right-3 left-3 z-50 lg:hidden',
                    'bottom-[calc(env(safe-area-inset-bottom)+92px)]',
                    'transition-all duration-300 ease-out',
                    open
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none translate-y-5 opacity-0',
                )}
            >
                <div
                    className={cn(
                        'rounded-[26px] border border-white/70 bg-surface/95 p-3',
                        'shadow-[0_16px_40px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.90)]',
                        'backdrop-blur-xl',
                    )}
                >
                    <div className="mb-2 flex justify-center">
                        <div className="h-1 w-10 rounded-full bg-border-strong/70" />
                    </div>

                    <div className="mb-3 flex items-center justify-between px-1">
                        <div>
                            <h3 className="text-sm font-medium text-foreground">
                                Menu Lainnya
                            </h3>
                            <p className="mt-0.5 text-[11px] font-light text-muted-foreground">
                                Fitur lainnya di Tamerin
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full',
                                'border-[1.5px] border-border-strong/70 bg-background/80',
                                'text-muted-foreground',
                                'shadow-[0_1px_3px_rgba(15,23,42,0.04)]',
                                'transition-all duration-200 ease-out',
                                'hover:-translate-y-[1px] hover:border-primary/30',
                                'hover:text-foreground',
                                'hover:shadow-[0_3px_8px_rgba(15,23,42,0.09)]',
                            )}
                            aria-label="Tutup menu"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {mobileMoreNavigationItems.map((item) => (
                            <MobileMoreMenuLink
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
            </div>
        </>
    );
}

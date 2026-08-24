import {
    BarChart3,
    Bell,
    CreditCard,
    HandCoins,
    Home,
    Landmark,
    Package,
    PiggyBank,
    Settings,
    Tag,
    Target,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface MenuItem {
    label: string;
    icon: LucideIcon;
    href: string;
    routeName?: string;
}

interface MenuGroup {
    items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
    {
        items: [
            {
                label: 'Dashboard',
                icon: Home,
                href: '/dashboard',
                routeName: 'dashboard',
            },
        ],
    },
    {
        items: [
            {
                label: 'Transaksi',
                icon: CreditCard,
                href: '/transactions',
                routeName: 'transactions',
            },
            {
                label: 'Akun Keuangan',
                icon: Landmark,
                href: '/accounts',
                routeName: 'accounts',
            },
            {
                label: 'Kategori',
                icon: Tag,
                href: '/categories',
                routeName: 'categories',
            },
            {
                label: 'Budget',
                icon: Wallet,
                href: '/budgets',
                routeName: 'budgets',
            },
        ],
    },
    {
        items: [
            {
                label: 'Target Tabungan',
                icon: Target,
                href: '/savings',
                routeName: 'savings',
            },
            {
                label: 'Investasi',
                icon: TrendingUp,
                href: '/investments',
                routeName: 'investments',
            },
            {
                label: 'Aset',
                icon: Package,
                href: '/assets',
                routeName: 'assets',
            },
            {
                label: 'Utang & Piutang',
                icon: HandCoins,
                href: '/debts',
                routeName: 'debts',
            },
        ],
    },
    {
        items: [
            {
                label: 'Pengingat',
                icon: Bell,
                href: '/reminders',
                routeName: 'reminders',
            },
            {
                label: 'Laporan',
                icon: BarChart3,
                href: '/reports',
                routeName: 'reports',
            },
        ],
    },
];

const bottomItems: MenuItem[] = [
    {
        label: 'Pengaturan',
        icon: Settings,
        href: '/settings/profile',
        routeName: 'settings',
    },
];

interface SidebarProps {
    currentPath?: string;
}

export default function Sidebar({
    currentPath = '/dashboard',
}: SidebarProps) {
    function isActive(item: MenuItem): boolean {
        return currentPath.startsWith(item.href);
    }

    function getMenuItemClass(active: boolean) {
        return cn(
            // Base
            'group relative',
            'flex h-11 w-11 items-center justify-center',
            'rounded-full',

            // Border selalu sama ketebalannya
            'border-2',

            // Animasi
            'transition-all duration-200 ease-out',

            active
                ? [
                      // ACTIVE
                      'border-white/80',
                      'border-x-primary/30',

                      // Surface seperti navbar active
                      'bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.92)_45%,rgba(235,238,242,0.82)_100%)]',

                      'text-primary',

                      // Raised
                      '-translate-y-[1px]',

                      'shadow-[0_4px_10px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.05)]',
                  ]
                : [
                      // NORMAL
                      'border-border-strong/70',

                      'bg-background/80',

                      'text-muted-foreground',

                      // Depth tipis
                      'shadow-[0_1px_3px_rgba(15,23,42,0.04)]',

                      // HOVER
                      'hover:-translate-y-[1px]',

                      'hover:border-white/80',
                      'hover:border-x-primary/30',

                      'hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.92)_45%,rgba(235,238,242,0.82)_100%)]',

                      'hover:text-primary',

                      'hover:shadow-[0_3px_8px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.04)]',
                  ],
        );
    }

    return (
        <aside
            className={cn(
                // Position
                'sticky top-3 z-20',
                'ml-3',
                'hidden lg:flex',

                // Size
                'h-[calc(100vh-24px)]',
                'w-[72px]',
                'flex-col items-center',

                // Shape
                'rounded-[22px]',

                // Border
                'border border-white/60',

                // Surface
                'bg-surface/90',

                // Floating shadow seperti navbar
                'shadow-[0_8px_24px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.90),inset_0_-1px_0_rgba(15,23,42,0.03)]',

                // Glass
                'backdrop-blur-xl',

                // Spacing
                'py-3',

                // Penting untuk tooltip
                'overflow-visible',
            )}
        >
            {/* Logo */}
            <a
                href="/dashboard"
                aria-label="Tamerin"
                className={cn(
                    'mb-5',
                    'flex h-11 w-11 items-center justify-center',
                    'rounded-[14px]',

                    // Primary identity
                    'bg-primary',
                    'text-primary-foreground',

                    // Border
                    'border-2 border-primary/40',

                    // Depth
                    'shadow-[0_2px_5px_rgba(15,23,42,0.10)]',

                    // Hover naik
                    'transition-all duration-200 ease-out',
                    'hover:-translate-y-[1px]',
                    'hover:brightness-105',

                    'hover:shadow-[0_6px_12px_rgba(15,23,42,0.16)]',
                )}
            >
                <PiggyBank className="h-5 w-5" />
            </a>

            {/* Navigation */}
            <nav className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-2">
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="w-full">
                        {/* Separator */}
                        {groupIndex > 0 && (
                            <div className="mx-2 my-2.5 h-px bg-border-strong/50" />
                        )}

                        <div className="flex flex-col items-center gap-1.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item);

                                return (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        title={item.label}
                                        className={getMenuItemClass(active)}
                                    >
                                        <Icon className="h-[18px] w-[18px]" />

                                        {/* Tooltip */}
                                        <span
                                            className={cn(
                                                'pointer-events-none',

                                                'absolute top-1/2 left-full',
                                                'ml-3',
                                                '-translate-y-1/2',

                                                'whitespace-nowrap',
                                                'rounded-xl',

                                                'border border-border-strong/60',

                                                'bg-surface/95',
                                                'px-3 py-2',

                                                'text-xs font-normal text-foreground',

                                                'shadow-[0_6px_18px_rgba(15,23,42,0.12)]',
                                                'backdrop-blur-xl',

                                                'z-50',

                                                // Hidden
                                                'translate-x-1 opacity-0',

                                                // Animation
                                                'transition-all duration-150',

                                                // Show
                                                'group-hover:translate-x-0',
                                                'group-hover:opacity-100',
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom */}
            <div className="mt-auto w-full px-2 pt-2">
                {/* Separator */}
                <div className="mx-2 mb-2.5 h-px bg-border-strong/50" />

                <div className="flex flex-col items-center gap-1">
                    {bottomItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);

                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                title={item.label}
                                className={getMenuItemClass(active)}
                            >
                                <Icon className="h-[18px] w-[18px]" />

                                {/* Tooltip */}
                                <span
                                    className={cn(
                                        'pointer-events-none',

                                        'absolute top-1/2 left-full',
                                        'ml-3',
                                        '-translate-y-1/2',

                                        'whitespace-nowrap',
                                        'rounded-xl',

                                        'border border-border-strong/60',

                                        'bg-surface/95',
                                        'px-3 py-2',

                                        'text-xs font-normal text-foreground',

                                        'shadow-[0_6px_18px_rgba(15,23,42,0.12)]',
                                        'backdrop-blur-xl',

                                        'z-50',

                                        'translate-x-1 opacity-0',

                                        'transition-all duration-150',

                                        'group-hover:translate-x-0',
                                        'group-hover:opacity-100',
                                    )}
                                >
                                    {item.label}
                                </span>
                            </a>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}

import { useState } from 'react';

import {
    BarChart3,
    Bell,
    ChevronLeft,
    CreditCard,
    Folders,
    HandCoins,
    Home,
    Landmark,
    LineChart,
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
    title: string;
    items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
    {
        title: 'Ringkasan',
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
        title: 'Keuangan',
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
        title: 'Kekayaan',
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
        title: 'Lainnya',
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
    {
        title: 'Akun',
        items: [
            {
                label: 'Pengaturan',
                icon: Settings,
                href: '/settings/profile',
                routeName: 'settings',
            },
        ],
    },
];

interface SidebarProps {
    currentPath?: string;
}

export default function Sidebar({ currentPath = '/dashboard' }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    function isActive(item: MenuItem): boolean {
        return currentPath.startsWith(item.href);
    }

    return (
        <aside
            className={cn(
                'hidden lg:flex flex-col',
                'h-screen sticky top-0',
                'border-r border-border bg-surface',
                'transition-all duration-300 ease-in-out',
                collapsed ? 'w-[72px]' : 'w-64',
            )}
        >
            {/* Logo */}
            <div
                className={cn(
                    'flex items-center gap-3 px-5 pt-6 pb-4',
                    collapsed && 'justify-center px-0',
                )}
            >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
                    <PiggyBank className="h-5 w-5 text-primary-foreground" />
                </div>

                {!collapsed && (
                    <span className="text-lg font-bold text-foreground">
                        Tamerin
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
                {menuGroups.map((group) => (
                    <div key={group.title}>
                        {!collapsed && (
                            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {group.title}
                            </p>
                        )}

                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item);

                                return (
                                    <li key={item.label}>
                                        <a
                                            href={item.href}
                                            title={
                                                collapsed
                                                    ? item.label
                                                    : undefined
                                            }
                                            className={cn(
                                                'flex items-center gap-3 rounded-xl px-3 py-2.5',
                                                'text-sm font-medium',
                                                'transition-all duration-200',
                                                active
                                                    ? 'bg-primary-soft text-primary'
                                                    : 'text-foreground-secondary hover:bg-surface-muted hover:text-foreground',
                                                collapsed &&
                                                    'justify-center px-0',
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    'h-5 w-5 shrink-0',
                                                    active
                                                        ? 'text-primary'
                                                        : 'text-muted-foreground',
                                                )}
                                            />

                                            {!collapsed && (
                                                <span>{item.label}</span>
                                            )}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Collapse Toggle */}
            <div className="border-t border-border px-3 py-3">
                <button
                    type="button"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5',
                        'text-sm font-medium text-muted-foreground',
                        'transition-all duration-200',
                        'hover:bg-surface-muted hover:text-foreground',
                        collapsed && 'justify-center px-0',
                    )}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronLeft
                        className={cn(
                            'h-5 w-5 shrink-0 transition-transform duration-300',
                            collapsed && 'rotate-180',
                        )}
                    />

                    {!collapsed && <span>Ciutkan</span>}
                </button>
            </div>
        </aside>
    );
}

import { useState } from 'react';

import {
    CreditCard,
    Home,
    Menu,
    Plus,
    Wallet,
    X,
    BarChart3,
    Bell,
    Landmark,
    Package,
    PiggyBank,
    Settings,
    Tag,
    Target,
    TrendingUp,
    HandCoins,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface BottomTab {
    label: string;
    icon: LucideIcon;
    href: string;
    isFab?: boolean;
}

const bottomTabs: BottomTab[] = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Transaksi', icon: CreditCard, href: '/transactions' },
    { label: 'Tambah', icon: Plus, href: '#add-transaction', isFab: true },
    { label: 'Budget', icon: Wallet, href: '/budgets' },
    { label: 'Lainnya', icon: Menu, href: '#more' },
];

interface MoreMenuItem {
    label: string;
    icon: LucideIcon;
    href: string;
}

const moreMenuItems: MoreMenuItem[] = [
    { label: 'Akun Keuangan', icon: Landmark, href: '/accounts' },
    { label: 'Kategori', icon: Tag, href: '/categories' },
    { label: 'Target Tabungan', icon: Target, href: '/savings' },
    { label: 'Investasi', icon: TrendingUp, href: '/investments' },
    { label: 'Aset', icon: Package, href: '/assets' },
    { label: 'Utang & Piutang', icon: HandCoins, href: '/debts' },
    { label: 'Pengingat', icon: Bell, href: '/reminders' },
    { label: 'Laporan', icon: BarChart3, href: '/reports' },
    { label: 'Pengaturan', icon: Settings, href: '/settings/profile' },
];

interface MobileNavigationProps {
    currentPath?: string;
}

export default function MobileNavigation({
    currentPath = '/dashboard',
}: MobileNavigationProps) {
    const [moreOpen, setMoreOpen] = useState(false);

    function isActive(href: string): boolean {
        if (href.startsWith('#')) return false;
        return currentPath.startsWith(href);
    }

    return (
        <>
            {/* Bottom Sheet Overlay */}
            {moreOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setMoreOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Bottom Sheet */}
            <div
                className={cn(
                    'fixed inset-x-0 bottom-0 z-50 lg:hidden',
                    'transform transition-transform duration-300 ease-in-out',
                    moreOpen ? 'translate-y-0' : 'translate-y-full',
                )}
            >
                <div className="mx-2 mb-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] rounded-2xl border border-border bg-surface p-4 shadow-xl">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">
                            Menu Lainnya
                        </h3>
                        <button
                            type="button"
                            onClick={() => setMoreOpen(false)}
                            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                            aria-label="Tutup menu"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {moreMenuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        'flex flex-col items-center gap-1.5 rounded-xl px-2 py-3',
                                        'text-xs font-medium transition-colors',
                                        active
                                            ? 'bg-primary-soft text-primary'
                                            : 'text-foreground-secondary hover:bg-surface-muted',
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="text-center leading-tight">
                                        {item.label}
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Tab Bar */}
            <nav
                className={cn(
                    'fixed inset-x-0 bottom-0 z-50 lg:hidden',
                    'border-t border-border bg-surface',
                    'pb-[env(safe-area-inset-bottom)]',
                )}
            >
                <div className="flex items-center justify-around px-2 py-1.5">
                    {bottomTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = isActive(tab.href);

                        if (tab.isFab) {
                            return (
                                <button
                                    key={tab.label}
                                    type="button"
                                    className={cn(
                                        'flex h-12 w-12 items-center justify-center',
                                        'rounded-full bg-primary text-primary-foreground',
                                        'shadow-md transition-all duration-200',
                                        'hover:opacity-90 active:scale-95',
                                        '-mt-4',
                                    )}
                                    aria-label={tab.label}
                                >
                                    <Icon className="h-6 w-6" />
                                </button>
                            );
                        }

                        if (tab.href === '#more') {
                            return (
                                <button
                                    key={tab.label}
                                    type="button"
                                    onClick={() => setMoreOpen(!moreOpen)}
                                    className={cn(
                                        'flex flex-col items-center gap-0.5 px-3 py-1.5',
                                        'text-[10px] font-medium transition-colors',
                                        moreOpen
                                            ? 'text-primary'
                                            : 'text-muted-foreground',
                                    )}
                                    aria-label="Menu lainnya"
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        }

                        return (
                            <a
                                key={tab.label}
                                href={tab.href}
                                className={cn(
                                    'flex flex-col items-center gap-0.5 px-3 py-1.5',
                                    'text-[10px] font-medium transition-colors',
                                    active
                                        ? 'text-primary'
                                        : 'text-muted-foreground',
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{tab.label}</span>
                            </a>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}

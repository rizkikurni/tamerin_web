import {
    BarChart3,
    Bell,
    CreditCard,
    Home,
    LogOut,
    Search,
    Settings,
    User,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AppHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: { label: string; href?: string }[];
    children?: ReactNode;
    currentPath?: string;
}

interface NavTab {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navTabs: NavTab[] = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Transaksi', href: '/transactions', icon: CreditCard },
    { label: 'Laporan', href: '/reports', icon: BarChart3 },
];

function UserMenu() {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const user = {
        name: 'Rizki',
        email: 'rizki@tamerin.id',
        initials: 'RK',
    };

    return (
        <div className="relative z-50" ref={menuRef}>
            {/* User Button */}
           <button
    type="button"
    onClick={() => setOpen((prev) => !prev)}
    className={cn(
        'flex h-11 w-11 items-center justify-center',
        'rounded-full',

        // Warna utama
        'bg-primary',
        'text-xs font-semibold text-primary-foreground',

        // Border normal
        'border-2 border-primary/40',

        // Posisi & shadow normal
        'translate-y-0',
        'shadow-[0_2px_4px_rgba(15,23,42,0.10)]',

        // Animasi
        'transition-all duration-200 ease-out',

        // HOVER → benar-benar TERANGKAT
        'hover:-translate-y-0.5',
        'hover:brightness-105',
        'hover:border-primary/60',
        'hover:shadow-[0_7px_14px_rgba(15,23,42,0.20)]',

        // Saat menu terbuka tetap terangkat
        open && [
            '-translate-y-0.5',
            'brightness-105',
            'border-primary/60',
            'shadow-[0_7px_14px_rgba(15,23,42,0.20)]',
        ],
    )}
    aria-label="User menu"
    aria-expanded={open}
>
    {user.initials}
</button>

            {open && (
                <>
                    {/* Klik di luar */}
                    <div
                        className="fixed inset-0 z-50"
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Dropdown */}
                    <div
                        className={cn(
                            'absolute top-full right-0 z-50 mt-4',
                            'w-56 rounded-2xl',
                            'border border-border-strong/60',
                            'bg-surface/95 p-1.5',
                            'backdrop-blur-xl',

                            'shadow-[0_10px_30px_rgba(15,23,42,0.12)]',
                        )}
                    >
                        <div className="mb-1.5 border-b border-border px-3 py-2.5">
                            <p className="text-sm font-medium text-foreground">
                                {user.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                                {user.email}
                            </p>
                        </div>

                        <a
                            href="/settings/profile"
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground-secondary transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                            <User className="h-4 w-4" />
                            Profil
                        </a>

                        <a
                            href="/settings/preferences"
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground-secondary transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                            <Settings className="h-4 w-4" />
                            Pengaturan
                        </a>

                        <div className="my-1.5 border-t border-border" />

                        <button
                            type="button"
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                        >
                            <LogOut className="h-4 w-4" />
                            Keluar
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
export { UserMenu };

export default function AppHeader({
    currentPath = '/dashboard',
}: AppHeaderProps) {
    return (
        <header className="shadow-[ 0_8px_24px_rgba(15,23,42,0.07), inset_0_1px_0_rgba(255,255,255,0.90), inset_0_-1px_0_rgba(15,23,42,0.03) ] before:bg-[linear-gradient( 180deg, rgba(255,255,255,0.55)_0%, rgba(255,255,255,0.18)_45%, rgba(15,23,42,0.025)_100% )] sticky top-3 z-30 mx-4 mb-4 overflow-visible rounded-[22px] border border-white/60 bg-surface/90 backdrop-blur-xl transition-colors duration-200 before:pointer-events-none before:absolute before:inset-0 after:pointer-events-none after:absolute after:inset-x-4 after:top-0 after:h-px after:bg-white/90">
            <div className="relative z-10 mx-2 flex h-16 items-center justify-between gap-4">
                {/* Left: Pill Navigation Tabs */}
                <nav className="flex items-center gap-2">
                    {navTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = currentPath.startsWith(tab.href);

                        return (
                            <a
                                key={tab.label}
                                href={tab.href}
                                className={cn(
                                    'inline-flex h-11 items-center gap-2 rounded-full px-4',
                                    'text-sm font-normal',
                                    'border border-transparent',
                                    'transition-all duration-200',

                                    active
                                        ? [
                                              'relative overflow-hidden',

                                              // Border
                                              'border border-white/80',
                                              'border-x-2 border-x-primary/30',

                                              // Gradient permukaan
                                              'bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.92)_45%,rgba(235,238,242,0.82)_100%)]',

                                              'text-foreground',

                                              // Efek timbul + highlight bagian atas
                                              'shadow-[0_4px_10px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.05)]',

                                              // Sedikit naik
                                              '-translate-y-[1px]',
                                          ]
                                        : [
                                              // NORMAL
                                              'border-2 border-border-strong/70',
                                              'bg-background/80',
                                              'text-foreground',

                                              // shadow sangat tipis, border yang jadi utama
                                              'shadow-[0_1px_3px_rgba(15,23,42,0.04)]',

                                              // HOVER
                                              'hover:border-x-2',
                                              'hover:border-x-primary/30',

                                              'hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.92)_45%,rgba(235,238,242,0.82)_100%)]',

                                              'hover:shadow-[0_3px_8px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,1)]',

                                              'hover:-translate-y-[1px]',
                                          ],
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </a>
                        );
                    })}

                    {/* Search */}
                    <button
                        type="button"
                        className="ml-1 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-x-2 border-border-strong/70 border-x-border-strong/70 bg-background/80 text-muted-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[1px] hover:border-white/80 hover:border-x-primary/30 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.92)_45%,rgba(235,238,242,0.82)_100%)] hover:text-foreground hover:shadow-[0_3px_8px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.04)]"
                        aria-label="Cari"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                </nav>

                {/* Right: Notification + User */}
                <div className="flex items-center gap-2">
                    {/* Notification Bell */}
                    <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-x-2 border-border-strong/70 border-x-border-strong/70 bg-background/80 text-muted-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[1px] hover:border-white/80 hover:border-x-primary/30 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.92)_45%,rgba(235,238,242,0.82)_100%)] hover:text-foreground hover:shadow-[0_3px_8px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(15,23,42,0.04)]"
                        aria-label="Notifikasi"
                    >
                        <Bell className="h-[17px] w-[17px]" />
                    </button>

                    {/* User Avatar */}
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}

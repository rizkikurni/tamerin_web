import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { ChevronRight, LogOut, Settings, User } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AppHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: { label: string; href?: string }[];
    children?: ReactNode;
}

function UserMenu() {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Dummy user data — akan diganti di Fase 8
    const user = {
        name: 'Rizki',
        email: 'rizki@tamerin.id',
        initials: 'RK',
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex items-center gap-2 rounded-xl px-2 py-1.5',
                    'transition-colors duration-200',
                    'hover:bg-surface-muted',
                )}
                aria-label="User menu"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {user.initials}
                </div>

                <span className="hidden text-sm font-medium text-foreground md:block">
                    {user.name}
                </span>
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Dropdown */}
                    <div
                        className={cn(
                            'absolute right-0 top-full z-50 mt-2',
                            'w-56 rounded-2xl border border-border bg-surface p-1.5',
                            'shadow-lg',
                            'animate-in fade-in slide-in-from-top-2',
                        )}
                    >
                        <div className="border-b border-border px-3 py-2.5 mb-1.5">
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
                            onClick={() => {
                                // Akan diintegrasikan di Fase 8
                            }}
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
    title,
    description,
    breadcrumbs,
    children,
}: AppHeaderProps) {
    return (
        <header className="border-b border-border bg-surface px-6 py-4">
            <div className="flex items-start justify-between gap-4">
                {/* Left: Breadcrumbs + Title */}
                <div className="min-w-0 flex-1">
                    {/* Breadcrumbs */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <nav
                            aria-label="Breadcrumb"
                            className="mb-1.5 flex items-center gap-1 text-xs text-muted-foreground"
                        >
                            {breadcrumbs.map((crumb, index) => (
                                <span
                                    key={crumb.label}
                                    className="flex items-center gap-1"
                                >
                                    {index > 0 && (
                                        <ChevronRight className="h-3 w-3" />
                                    )}

                                    {crumb.href ? (
                                        <a
                                            href={crumb.href}
                                            className="transition-colors hover:text-foreground"
                                        >
                                            {crumb.label}
                                        </a>
                                    ) : (
                                        <span className="text-foreground-secondary">
                                            {crumb.label}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </nav>
                    )}

                    {/* Title */}
                    <h1 className="truncate text-xl font-semibold text-foreground">
                        {title}
                    </h1>

                    {/* Description */}
                    {description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>

                {/* Right: Page actions + User menu */}
                <div className="flex shrink-0 items-center gap-3">
                    {children}
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}

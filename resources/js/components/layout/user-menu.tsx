import { LogOut, Settings, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { edit as editPreferences } from '@/routes/preferences';
import { edit as editProfile } from '@/routes/profile';

interface UserMenuLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
}

function UserMenuLink({ href, icon: Icon, label }: UserMenuLinkProps) {
    return (
        <a
            href={href}
            role="menuitem"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground-secondary transition-colors hover:bg-surface-muted hover:text-foreground"
        >
            <Icon className="h-4 w-4" />
            {label}
        </a>
    );
}

export default function UserMenu() {
    const [open, setOpen] = useState(false);

    const user = {
        name: 'Rizki',
        email: 'rizki@tamerin.id',
        initials: 'RK',
    };

    return (
        <div className="relative z-50">
            <button
                type="button"
                onClick={() => setOpen((currentOpen) => !currentOpen)}
                className={cn(
                    'flex h-11 w-11 translate-y-0 items-center justify-center',
                    'rounded-full border-2 border-primary/40 bg-primary',
                    'text-xs font-medium text-primary-foreground',
                    'shadow-[var(--brand-shadow)]',
                    'transition-all duration-200 ease-out',
                    'hover:-translate-y-0.5 hover:border-primary/60',
                    'hover:brightness-105',
                    'hover:shadow-[var(--brand-shadow-hover)]',
                    open && [
                        '-translate-y-0.5 border-primary/60 brightness-105',
                        'shadow-[var(--brand-shadow-hover)]',
                    ],
                )}
                aria-label="User menu"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                {user.initials}
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-50"
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />

                    <div
                        role="menu"
                        className={cn(
                            'absolute top-full right-0 z-50 mt-4 w-56 rounded-2xl',
                            'border border-[var(--glass-border)] bg-surface/95 p-1.5',
                            'shadow-[var(--popup-shadow)]',
                            'backdrop-blur-xl',
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

                        <UserMenuLink
                            href={editProfile.url()}
                            icon={User}
                            label="Profil"
                        />
                        <UserMenuLink
                            href={editPreferences.url()}
                            icon={Settings}
                            label="Pengaturan"
                        />

                        <div className="my-1.5 border-t border-border" />

                        <button
                            type="button"
                            role="menuitem"
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

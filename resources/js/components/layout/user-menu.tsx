import { Link, usePage } from '@inertiajs/react';
import { LogOut, Settings, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { edit as editPreferences } from '@/routes/preferences';
import { edit as editProfile } from '@/routes/profile';

interface UserMenuLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
}

function UserMenuLink({ href, icon: Icon, label, onClick }: UserMenuLinkProps) {
    return (
        <Link
            href={href}
            role="menuitem"
            onClick={onClick}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground-secondary transition-colors hover:bg-surface-muted hover:text-foreground"
        >
            <Icon className="h-4 w-4" />
            {label}
        </Link>
    );
}

function getUserInitials(name: string): string {
    const nameParts = name.trim().split(/\s+/).filter(Boolean);

    if (nameParts.length === 0) {
        return 'U';
    }

    if (nameParts.length === 1) {
        return nameParts[0].charAt(0).toUpperCase();
    }

    return `${nameParts[0].charAt(0)}${nameParts.at(-1)?.charAt(0) ?? ''}`.toUpperCase();
}

interface UserMenuProps {
    triggerClassName?: string;
}

export default function UserMenu({ triggerClassName }: UserMenuProps = {}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const user = usePage().props.auth.user;

    useEffect(() => {
        if (!open) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    if (!user) {
        return null;
    }

    const initials = getUserInitials(user.name);

    return (
        <div ref={containerRef} className="relative z-50">
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
                    triggerClassName,
                )}
                aria-label="User menu"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                {initials}
            </button>

            {open && (
                <div
                    role="menu"
                    className={cn(
                        'absolute top-full right-0 z-50 mt-2.5 w-56 max-w-[calc(100vw-1.5rem)] rounded-2xl sm:mt-3',
                        'border border-[var(--glass-border-strong)] bg-surface p-1.5',
                        'shadow-[var(--popup-shadow)]',
                    )}
                >
                    <div className="mb-1.5 border-b border-border px-3 py-2.5">
                        <p className="truncate text-sm font-medium text-foreground">
                            {user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                        </p>
                    </div>

                    <UserMenuLink
                        href={editProfile.url()}
                        icon={User}
                        label="Profil"
                        onClick={() => setOpen(false)}
                    />
                    <UserMenuLink
                        href={editPreferences.url()}
                        icon={Settings}
                        label="Pengaturan"
                        onClick={() => setOpen(false)}
                    />

                    <div className="my-1.5 border-t border-border" />

                    <Link
                        href={logout()}
                        as="button"
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar
                    </Link>
                </div>
            )}
        </div>
    );
}

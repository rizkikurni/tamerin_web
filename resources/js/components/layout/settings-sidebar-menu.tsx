import { Link } from '@inertiajs/react';
import { KeyRound, Palette, Settings, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { edit as passwordEdit } from '@/routes/password';
import { edit as preferencesEdit } from '@/routes/preferences';
import { edit as profileEdit } from '@/routes/profile';

import { SidebarNavigationButton } from './navigation-primitives';

interface SettingsSidebarMenuProps {
    currentPath: string;
}

interface SettingsMenuItem {
    label: string;
    description: string;
    href: string;
    icon: LucideIcon;
}

const settingsMenuItems: SettingsMenuItem[] = [
    {
        label: 'Profil',
        description: 'Nama dan alamat email',
        href: profileEdit.url(),
        icon: UserRound,
    },
    {
        label: 'Kata Sandi',
        description: 'Keamanan akun',
        href: passwordEdit.url(),
        icon: KeyRound,
    },
    {
        label: 'Preferensi',
        description: 'Tema dan zona waktu',
        href: preferencesEdit.url(),
        icon: Palette,
    },
];

export default function SettingsSidebarMenu({
    currentPath,
}: SettingsSidebarMenuProps) {
    const [open, setOpen] = useState(false);
    const menuContainerRef = useRef<HTMLDivElement>(null);
    const settingsPathActive = currentPath.startsWith('/settings');

    useEffect(() => {
        if (!open) {
            return;
        }

        function closeWhenClickingOutside(event: PointerEvent) {
            if (
                menuContainerRef.current &&
                !menuContainerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        function closeWithEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        document.addEventListener('pointerdown', closeWhenClickingOutside);
        document.addEventListener('keydown', closeWithEscape);

        return () => {
            document.removeEventListener(
                'pointerdown',
                closeWhenClickingOutside,
            );
            document.removeEventListener('keydown', closeWithEscape);
        };
    }, [open]);

    return (
        <div ref={menuContainerRef} className="relative flex justify-center">
            <SidebarNavigationButton
                label="Pengaturan"
                icon={<Settings className="h-[18px] w-[18px]" />}
                active={settingsPathActive || open}
                showTooltip={!open}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((currentOpen) => !currentOpen)}
            />

            {open && (
                <div
                    role="menu"
                    aria-label="Menu pengaturan"
                    className={cn(
                        'absolute bottom-0 left-full z-50 ml-4 w-64 rounded-[22px]',
                        'border border-[var(--glass-border)] bg-surface/95 p-2',
                        'shadow-[var(--popup-shadow)] backdrop-blur-xl',
                    )}
                >
                    <div className="border-b border-border px-3 py-2.5">
                        <p className="text-sm font-medium text-foreground">
                            Pengaturan
                        </p>
                        <p className="text-xs font-light text-muted-foreground">
                            Kelola akun dan tampilan
                        </p>
                    </div>

                    <div className="grid gap-1 pt-1.5">
                        {settingsMenuItems.map((item) => {
                            const Icon = item.icon;
                            const active = currentPath.startsWith(item.href);

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    role="menuitem"
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-2xl px-3 py-2.5',
                                        'transition-all duration-200',
                                        active
                                            ? 'bg-primary-soft text-primary'
                                            : 'text-foreground-secondary hover:bg-surface-muted hover:text-foreground',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                                            active
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-background/70 text-muted-foreground',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <span className="grid gap-0.5">
                                        <span className="text-sm font-medium">
                                            {item.label}
                                        </span>
                                        <span className="text-[11px] font-light text-muted-foreground">
                                            {item.description}
                                        </span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

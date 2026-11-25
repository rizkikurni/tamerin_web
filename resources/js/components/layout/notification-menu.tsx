import { Link, useHttp, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Bell,
    CalendarClock,
    PiggyBank,
    TrendingDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import Spinner from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { index as remindersIndex } from '@/routes/reminders';
import { index as systemRemindersIndex } from '@/routes/system-reminders';
import type { SystemReminder, SystemReminderResponse } from '@/types';

import { HeaderActionButton } from './navigation-primitives';

const reminderIcons: Record<SystemReminder['type'], LucideIcon> = {
    budget: AlertTriangle,
    obligation: CalendarClock,
    savings: PiggyBank,
    investment: TrendingDown,
};

const priorityClasses: Record<SystemReminder['priority'], string> = {
    high: 'bg-danger/10 text-danger',
    medium: 'bg-warning/10 text-warning',
    low: 'bg-primary-soft text-primary',
};

interface NotificationMenuProps {
    triggerClassName?: string;
}

export default function NotificationMenu({
    triggerClassName,
}: NotificationMenuProps = {}) {
    const { notificationsCount } = usePage().props;
    const initialCount =
        typeof notificationsCount === 'number' ? notificationsCount : 0;

    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [response, setResponse] = useState<SystemReminderResponse | null>(
        null,
    );
    const [failed, setFailed] = useState(false);
    const { get, processing } = useHttp<
        Record<string, never>,
        SystemReminderResponse
    >({});

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

    const loadReminders = () => {
        setFailed(false);

        get(systemRemindersIndex.url(), {
            onSuccess: (data) => {
                setResponse(data);
                setLoaded(true);
            },
            onHttpException: () => setFailed(true),
            onNetworkError: () => setFailed(true),
        });
    };

    const toggleMenu = () => {
        const nextOpen = !open;
        setOpen(nextOpen);

        if (nextOpen && (!loaded || failed) && !processing) {
            loadReminders();
        }
    };

    const count = response?.count ?? initialCount;

    return (
        <div ref={containerRef} className="sm:relative">
            <HeaderActionButton
                label="Pengingat"
                className={triggerClassName}
                aria-expanded={open}
                aria-controls="system-reminder-menu"
                onClick={toggleMenu}
                icon={
                    <span className="relative">
                        <Bell className="h-[17px] w-[17px]" />
                        {count > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-medium text-white">
                                {Math.min(count, 9)}
                                {count > 9 ? '+' : ''}
                            </span>
                        )}
                    </span>
                }
            />

            {open && (
                <div
                    id="system-reminder-menu"
                    className={cn(
                        'absolute inset-x-0 top-full z-50 mt-2.5 sm:inset-x-auto sm:right-0 sm:mt-3 sm:w-96',
                        'overflow-hidden rounded-[22px] border border-[var(--glass-border-strong)]',
                        'bg-surface shadow-[var(--popup-shadow)]',
                        'before:pointer-events-none before:absolute before:inset-0',
                        'before:[background-image:var(--glass-gradient)]',
                    )}
                >
                    <div className="relative z-10 flex items-start justify-between gap-4 border-b border-border/70 p-4">
                        <div>
                            <h2 className="text-sm font-medium text-foreground">
                                Pengingat
                            </h2>
                            <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                Hal yang perlu kamu perhatikan.
                            </p>
                        </div>
                        {count > 0 && (
                            <span className="shrink-0 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
                                {count} aktif
                            </span>
                        )}
                    </div>

                    <div className="relative z-10 max-h-[min(22rem,calc(100dvh-12rem))] overflow-y-auto overscroll-contain p-2">
                        {processing && !loaded && (
                            <div className="flex min-h-36 flex-col items-center justify-center gap-3 text-center">
                                <Spinner size="sm" />
                                <p className="text-xs font-light text-muted-foreground">
                                    Memeriksa pengingat...
                                </p>
                            </div>
                        )}

                        {failed && !processing && (
                            <div className="flex min-h-36 flex-col items-center justify-center gap-3 px-4 text-center">
                                <p className="text-sm text-foreground">
                                    Pengingat belum dapat dimuat.
                                </p>
                                <button
                                    type="button"
                                    onClick={loadReminders}
                                    className="rounded-xl bg-primary-soft px-3 py-2 text-xs font-medium text-primary transition hover:opacity-85"
                                >
                                    Coba lagi
                                </button>
                            </div>
                        )}

                        {loaded && response?.reminders.length === 0 && (
                            <div className="flex min-h-36 flex-col items-center justify-center gap-3 px-4 text-center">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/10 text-success">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Tidak ada pengingat aktif
                                    </p>
                                    <p className="mt-1 text-xs font-light text-muted-foreground">
                                        Kondisi keuanganmu tidak memerlukan
                                        perhatian saat ini.
                                    </p>
                                </div>
                            </div>
                        )}

                        {response?.reminders.map((reminder) => {
                            const Icon = reminderIcons[reminder.type];

                            return (
                                <Link
                                    key={reminder.id}
                                    href={reminder.href}
                                    onClick={() => setOpen(false)}
                                    className="flex gap-3 rounded-2xl p-3 transition-colors hover:bg-surface-muted active:bg-surface-muted"
                                >
                                    <div
                                        className={cn(
                                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                                            priorityClasses[reminder.priority],
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {reminder.title}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 font-light text-muted-foreground">
                                            {reminder.message}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="relative z-10 border-t border-border/70 p-2">
                        <Link
                            href={remindersIndex.url()}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary-soft"
                        >
                            <span>Lihat semua pengingat</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

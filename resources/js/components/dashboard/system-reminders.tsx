import {
    AlertTriangle,
    ArrowRight,
    Bell,
    CalendarClock,
    TrendingDown,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Dummy data — akan diganti di Fase 8
type ReminderPriority = 'high' | 'medium' | 'low';

interface Reminder {
    id: number;
    message: string;
    icon: LucideIcon;
    priority: ReminderPriority;
    href: string;
}

const reminders: Reminder[] = [
    {
        id: 1,
        message: 'Budget Belanja melebihi batas',
        icon: AlertTriangle,
        priority: 'high',
        href: '/budgets',
    },
    {
        id: 2,
        message: 'Budget Makanan mendekati batas (85%)',
        icon: Wallet,
        priority: 'medium',
        href: '/budgets',
    },
    {
        id: 3,
        message: 'Utang ke Budi jatuh tempo 3 hari lagi',
        icon: CalendarClock,
        priority: 'high',
        href: '/debts',
    },
    {
        id: 4,
        message: 'Target Tabungan Liburan tertinggal jadwal',
        icon: TrendingDown,
        priority: 'medium',
        href: '/savings',
    },
    {
        id: 5,
        message: 'Data investasi belum diperbarui 30 hari',
        icon: Bell,
        priority: 'low',
        href: '/investments',
    },
];

const priorityConfig: Record<
    ReminderPriority,
    { bgClass: string; iconClass: string; dotClass: string }
> = {
    high: {
        bgClass: 'bg-danger/10',
        iconClass: 'text-danger',
        dotClass: 'bg-danger',
    },
    medium: {
        bgClass: 'bg-warning/10',
        iconClass: 'text-warning',
        dotClass: 'bg-warning',
    },
    low: {
        bgClass: 'bg-primary-soft',
        iconClass: 'text-primary',
        dotClass: 'bg-primary',
    },
};

export default function SystemReminders() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">
                            Pengingat
                        </h3>
                        {reminders.length > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                                {reminders.length}
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-2">
                {reminders.map((reminder) => {
                    const Icon = reminder.icon;
                    const config = priorityConfig[reminder.priority];

                    return (
                        <a
                            key={reminder.id}
                            href={reminder.href}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-3 py-2.5',
                                'transition-colors hover:bg-surface-muted',
                                'group',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                                    config.bgClass,
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'h-4 w-4',
                                        config.iconClass,
                                    )}
                                />
                            </div>

                            <p className="flex-1 text-sm text-foreground-secondary group-hover:text-foreground">
                                {reminder.message}
                            </p>

                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </a>
                    );
                })}
            </CardContent>
        </Card>
    );
}

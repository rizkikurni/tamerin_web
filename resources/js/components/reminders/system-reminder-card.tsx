import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarClock,
    ChevronRight,
    PiggyBank,
    TrendingDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SystemReminder } from '@/types';

const icons: Record<SystemReminder['type'], LucideIcon> = {
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

export default function SystemReminderCard({
    reminder,
}: {
    reminder: SystemReminder;
}) {
    const Icon = icons[reminder.type];

    return (
        <Link href={reminder.href} className="group block">
            <Card
                variant="navbar"
                className="transition-[transform,border-color,box-shadow] group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-[var(--control-shadow-hover)]"
            >
                <CardContent className="flex items-center gap-3 p-4 sm:p-5">
                    <div
                        className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                            priorityClasses[reminder.priority],
                        )}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium text-foreground">
                            {reminder.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 font-light text-muted-foreground">
                            {reminder.message}
                        </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </CardContent>
            </Card>
        </Link>
    );
}

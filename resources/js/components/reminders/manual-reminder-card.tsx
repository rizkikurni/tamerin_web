import { CalendarDays, Check, Clock3, Pencil, X } from 'lucide-react';

import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/formatters';
import type { ManualReminderListItem } from '@/types';

const statusLabels = {
    active: 'Aktif',
    done: 'Selesai',
    dismissed: 'Diabaikan',
} as const;

export default function ManualReminderCard({
    reminder,
    processing,
    onEdit,
    onComplete,
    onDismiss,
}: {
    reminder: ManualReminderListItem;
    processing: boolean;
    onEdit: () => void;
    onComplete: () => void;
    onDismiss: () => void;
}) {
    const active = reminder.status === 'active';

    return (
        <Card variant="navbar">
            <CardContent className="grid gap-4 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                                reminder.group === 'overdue'
                                    ? 'bg-danger/10 text-danger'
                                    : reminder.group === 'today'
                                      ? 'bg-warning/10 text-warning'
                                      : reminder.status === 'done'
                                        ? 'bg-success/10 text-success'
                                        : 'bg-primary-soft text-primary'
                            }`}
                        >
                            {reminder.status === 'done' ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Clock3 className="h-4 w-4" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-medium text-foreground">
                                {reminder.title}
                            </h3>
                            <p className="mt-1 flex items-center gap-1.5 text-xs font-light text-muted-foreground">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {reminder.due_on
                                    ? formatDate(reminder.due_on)
                                    : 'Tanpa tanggal'}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant={
                            reminder.status === 'done'
                                ? 'success'
                                : reminder.status === 'dismissed'
                                  ? 'muted'
                                  : reminder.group === 'overdue'
                                    ? 'danger'
                                    : 'default'
                        }
                    >
                        {reminder.group === 'overdue'
                            ? 'Terlambat'
                            : statusLabels[reminder.status]}
                    </Badge>
                </div>

                {reminder.note && (
                    <p className="rounded-2xl border border-primary/10 bg-primary-soft/55 p-3 text-xs leading-5 font-light text-muted-foreground dark:border-border dark:bg-background/55">
                        {reminder.note}
                    </p>
                )}

                {active && (
                    <div className="flex flex-wrap justify-end gap-2 border-t border-border/70 pt-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={processing}
                            onClick={onEdit}
                        >
                            <Pencil className="h-4 w-4" />
                            Ubah
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={processing}
                            onClick={onDismiss}
                        >
                            <X className="h-4 w-4" />
                            Abaikan
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            loading={processing}
                            onClick={onComplete}
                        >
                            <Check className="h-4 w-4" />
                            Selesai
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

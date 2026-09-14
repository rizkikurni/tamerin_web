import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    CalendarCheck,
    CalendarClock,
    CheckCircle2,
    Plus,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import SummaryCard from '@/components/dashboard/summary-card';
import { StatusMessage } from '@/components/form-controls';
import ManualReminderCard from '@/components/reminders/manual-reminder-card';
import ReminderFilters from '@/components/reminders/reminder-filters';
import ReminderFormDialog from '@/components/reminders/reminder-form-dialog';
import SystemReminderCard from '@/components/reminders/system-reminder-card';
import Button, { ButtonLink } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { complete, dismiss, index } from '@/routes/reminders';
import type {
    ManualReminderFilters,
    ManualReminderGroup,
    ManualReminderListItem,
    ManualReminderSummary,
    PaginatedData,
    SelectOption,
    SystemReminder,
} from '@/types';

const groups: Array<{
    value: ManualReminderGroup;
    label: string;
    description: string;
}> = [
    {
        value: 'overdue',
        label: 'Terlambat',
        description: 'Sudah melewati tanggal yang ditentukan.',
    },
    {
        value: 'today',
        label: 'Hari ini',
        description: 'Perlu ditindaklanjuti hari ini.',
    },
    {
        value: 'upcoming',
        label: 'Mendatang',
        description: 'Pengingat dengan tanggal berikutnya.',
    },
    {
        value: 'no_due',
        label: 'Tanpa tanggal',
        description: 'Catatan fleksibel tanpa batas waktu.',
    },
    {
        value: 'completed',
        label: 'Selesai atau diabaikan',
        description: 'Riwayat pengingat yang sudah ditutup.',
    },
];

type Props = {
    manualReminders: PaginatedData<ManualReminderListItem>;
    systemReminders: SystemReminder[];
    summary: ManualReminderSummary;
    filters: ManualReminderFilters;
    statusOptions: SelectOption[];
    dueFilterOptions: SelectOption[];
};

export default function ReminderIndex({
    manualReminders,
    systemReminders,
    summary,
    filters,
    statusOptions,
    dueFilterOptions,
}: Props) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState<'manual' | 'system'>('manual');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingReminder, setEditingReminder] =
        useState<ManualReminderListItem | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const hasFilter = Object.values(filters).some(Boolean);

    const applyFilter = (key: keyof ManualReminderFilters, value: string) => {
        router.get(
            index.url(),
            { ...filters, [key]: value || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    const openCreate = () => {
        setEditingReminder(null);
        setDialogOpen(true);
    };

    const openEdit = (reminder: ManualReminderListItem) => {
        setEditingReminder(reminder);
        setDialogOpen(true);
    };

    const transition = (
        reminder: ManualReminderListItem,
        action: 'complete' | 'dismiss',
    ) => {
        const url =
            action === 'complete'
                ? complete.url(reminder.id)
                : dismiss.url(reminder.id);

        router.patch(
            url,
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessingId(reminder.id),
                onFinish: () => setProcessingId(null),
            },
        );
    };

    return (
        <AppLayout
            title="Pengingat"
            description="Kelola pengingat pribadi dan lihat perhatian otomatis dari data keuangan."
            breadcrumbs={[{ label: 'Pengingat' }]}
            currentPath={index.url()}
            headerActions={
                <Button
                    type="button"
                    size="sm"
                    className="rounded-full px-4"
                    onClick={openCreate}
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Pengingat</span>
                </Button>
            }
        >
            <Head title="Pengingat" />

            <div className="grid w-full gap-5">
                <StatusMessage message={flash.status} />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Pengingat Aktif"
                        value={summary.activeCount.toString()}
                        comparison="Masih perlu ditindaklanjuti"
                        icon={<Bell className="h-5 w-5 text-primary" />}
                        iconBg="bg-primary-soft"
                    />
                    <SummaryCard
                        title="Jatuh Tempo Hari Ini"
                        value={summary.dueTodayCount.toString()}
                        comparison="Prioritas untuk hari ini"
                        icon={
                            <CalendarClock className="h-5 w-5 text-warning" />
                        }
                        iconBg="bg-warning/10"
                    />
                    <SummaryCard
                        title="Terlambat"
                        value={summary.overdueCount.toString()}
                        comparison="Sudah melewati tanggal"
                        icon={<AlertTriangle className="h-5 w-5 text-danger" />}
                        iconBg="bg-danger/10"
                    />
                    <SummaryCard
                        title="Selesai Bulan Ini"
                        value={summary.completedThisMonthCount.toString()}
                        comparison="Ditandai selesai bulan berjalan"
                        icon={
                            <CalendarCheck className="h-5 w-5 text-success" />
                        }
                        iconBg="bg-success/10"
                    />
                </div>

                <div className="flex w-fit gap-1 rounded-full border border-border bg-surface p-1 shadow-[var(--control-shadow)]">
                    <button
                        type="button"
                        onClick={() => setActiveTab('manual')}
                        className={cn(
                            'rounded-full px-4 py-2 text-sm font-medium transition',
                            activeTab === 'manual'
                                ? 'bg-primary text-primary-foreground shadow-[var(--brand-shadow)]'
                                : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                        )}
                    >
                        Manual ({manualReminders.total})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('system')}
                        className={cn(
                            'rounded-full px-4 py-2 text-sm font-medium transition',
                            activeTab === 'system'
                                ? 'bg-primary text-primary-foreground shadow-[var(--brand-shadow)]'
                                : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                        )}
                    >
                        Sistem ({systemReminders.length})
                    </button>
                </div>

                {activeTab === 'manual' ? (
                    <div className="grid gap-5">
                        <ReminderFilters
                            filters={filters}
                            statusOptions={statusOptions}
                            dueFilterOptions={dueFilterOptions}
                            onFilter={applyFilter}
                        />

                        {manualReminders.data.length === 0 ? (
                            <EmptyState
                                icon={<Bell className="h-7 w-7 text-primary" />}
                                title={
                                    hasFilter
                                        ? 'Tidak ada pengingat yang cocok'
                                        : 'Belum ada pengingat manual'
                                }
                                description={
                                    hasFilter
                                        ? 'Ubah atau reset filter untuk melihat pengingat lain.'
                                        : 'Tambahkan pengingat pertama untuk mencatat hal yang perlu ditindaklanjuti.'
                                }
                                action={
                                    hasFilter ? (
                                        <ButtonLink
                                            href={index.url()}
                                            variant="ghost"
                                        >
                                            Reset filter
                                        </ButtonLink>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={openCreate}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Tambah pengingat
                                        </Button>
                                    )
                                }
                            />
                        ) : (
                            <>
                                <div className="grid gap-6">
                                    {groups.map((group) => {
                                        const reminders =
                                            manualReminders.data.filter(
                                                (reminder) =>
                                                    reminder.group ===
                                                    group.value,
                                            );

                                        if (reminders.length === 0) {
                                            return null;
                                        }

                                        return (
                                            <section
                                                key={group.value}
                                                className="grid gap-3"
                                            >
                                                <div>
                                                    <h2 className="text-base font-medium text-foreground">
                                                        {group.label}
                                                    </h2>
                                                    <p className="mt-1 text-xs font-light text-muted-foreground">
                                                        {group.description}
                                                    </p>
                                                </div>
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    {reminders.map(
                                                        (reminder) => (
                                                            <ManualReminderCard
                                                                key={
                                                                    reminder.id
                                                                }
                                                                reminder={
                                                                    reminder
                                                                }
                                                                processing={
                                                                    processingId ===
                                                                    reminder.id
                                                                }
                                                                onEdit={() =>
                                                                    openEdit(
                                                                        reminder,
                                                                    )
                                                                }
                                                                onComplete={() =>
                                                                    transition(
                                                                        reminder,
                                                                        'complete',
                                                                    )
                                                                }
                                                                onDismiss={() =>
                                                                    transition(
                                                                        reminder,
                                                                        'dismiss',
                                                                    )
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </section>
                                        );
                                    })}
                                </div>

                                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                                    <p className="text-xs font-light text-muted-foreground">
                                        Menampilkan {manualReminders.from}–
                                        {manualReminders.to} dari{' '}
                                        {manualReminders.total} pengingat
                                    </p>
                                    <Pagination links={manualReminders.links} />
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <div className="rounded-[22px] border border-primary/20 bg-primary-soft/45 p-4">
                            <div className="flex items-start gap-3">
                                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                <div>
                                    <h2 className="text-sm font-medium text-foreground">
                                        Pengingat otomatis
                                    </h2>
                                    <p className="mt-1 text-xs leading-5 font-light text-muted-foreground">
                                        Dihitung langsung dari budget,
                                        kewajiban, target tabungan, dan
                                        investasi. Selesaikan sumber masalah
                                        agar pengingat hilang otomatis.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {systemReminders.length === 0 ? (
                            <EmptyState
                                icon={
                                    <CheckCircle2 className="h-7 w-7 text-success" />
                                }
                                title="Tidak ada perhatian sistem"
                                description="Data keuangan Anda tidak memerlukan tindak lanjut saat ini."
                            />
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2">
                                {systemReminders.map((reminder) => (
                                    <SystemReminderCard
                                        key={reminder.id}
                                        reminder={reminder}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ReminderFormDialog
                open={dialogOpen}
                reminder={editingReminder}
                onClose={() => setDialogOpen(false)}
            />
        </AppLayout>
    );
}

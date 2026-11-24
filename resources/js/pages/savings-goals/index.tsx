import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    PiggyBank,
    Plus,
    RotateCcw,
    Target,
    Wallet,
} from 'lucide-react';

import SummaryCard from '@/components/dashboard/summary-card';
import { StatusMessage } from '@/components/form-controls';
import SavingsGoalCard from '@/components/savings-goals/savings-goal-card';
import { ButtonLink } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { create, index } from '@/routes/savings-goals';
import type {
    PaginatedData,
    SavingsGoalFilters,
    SavingsGoalListItem,
    SavingsGoalSummary,
    SelectOption,
} from '@/types';

type SavingsGoalIndexProps = {
    goals: PaginatedData<SavingsGoalListItem>;
    summary: SavingsGoalSummary;
    filters: SavingsGoalFilters;
    statusOptions: SelectOption[];
};

export default function SavingsGoalIndex({
    goals,
    summary,
    filters,
}: SavingsGoalIndexProps) {
    const { flash } = usePage().props;
    const currentStatus = filters.status ?? '';

    const selectStatus = (status: string) => {
        router.get(
            status === '' ? index.url() : index.url({ query: { status } }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const statusTabs = [
        { label: 'Semua', value: '', count: null },
        { label: 'Aktif', value: 'active', count: summary.activeCount },
        { label: 'Selesai', value: 'completed', count: summary.completedCount },
        { label: 'Diarsipkan', value: 'archived', count: null },
    ];

    return (
        <AppLayout
            title="Target Tabungan"
            description="Pantau progres rencana menabung dan riwayat setorannya."
            breadcrumbs={[{ label: 'Kekayaan' }, { label: 'Target Tabungan' }]}
            currentPath={index.url()}
            headerActions={
                <ButtonLink
                    href={create.url()}
                    size="sm"
                    className="rounded-full px-4 shadow-[var(--control-shadow)]"
                >
                    <Plus className="h-4 w-4" />
                    <span>Buat Target</span>
                </ButtonLink>
            }
        >
            <Head title="Target Tabungan" />

            <div className="grid w-full gap-5">
                <StatusMessage message={flash.status} />

                {/* Summary Cards */}
                <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Target Aktif"
                        value={summary.activeCount.toString()}
                        comparison="Target yang sedang berjalan"
                        icon={<Target className="h-5 w-5 text-primary" />}
                        iconBg="bg-primary-soft"
                    />
                    <SummaryCard
                        title="Total Target"
                        value={formatRupiah(summary.totalTarget)}
                        comparison="Tidak termasuk target diarsipkan"
                        icon={<Wallet className="h-5 w-5 text-accent" />}
                        iconBg="bg-accent-soft"
                    />
                    <SummaryCard
                        title="Total Terkumpul"
                        value={formatRupiah(summary.totalSaved)}
                        comparison="Akumulasi dari setoran aktif"
                        icon={<PiggyBank className="h-5 w-5 text-success" />}
                        iconBg="bg-success/10"
                    />
                    <SummaryCard
                        title="Target Selesai"
                        value={summary.completedCount.toString()}
                        comparison="Target yang berhasil dicapai"
                        icon={<CheckCircle2 className="h-5 w-5 text-success" />}
                        iconBg="bg-success/10"
                    />
                </div>

                {/* Status Segmented Filter Bar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[var(--control-shadow)] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        {statusTabs.map((tab) => {
                            const isActive = currentStatus === tab.value;

                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => selectStatus(tab.value)}
                                    className={cn(
                                        'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95',
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                                    )}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count !== null && (
                                        <span
                                            className={cn(
                                                'py-0.2 rounded-full px-1.5 text-[10px] font-semibold',
                                                isActive
                                                    ? 'bg-primary-foreground/20 text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {currentStatus !== '' && (
                        <button
                            type="button"
                            onClick={() => selectStatus('')}
                            className="inline-flex items-center gap-1 text-xs font-light text-muted-foreground hover:text-foreground"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset filter
                        </button>
                    )}
                </div>

                {/* Goals List */}
                {goals.data.length === 0 ? (
                    <EmptyState
                        icon={<Target className="h-7 w-7 text-primary" />}
                        title={
                            currentStatus !== ''
                                ? 'Tidak ada target dengan status ini'
                                : 'Belum ada target tabungan'
                        }
                        description={
                            currentStatus !== ''
                                ? 'Coba ganti filter status untuk melihat target lainnya.'
                                : 'Buat target pertama untuk mulai mewujudkan impian finansial Anda.'
                        }
                        action={
                            currentStatus !== '' ? (
                                <button
                                    type="button"
                                    className="text-sm font-medium text-primary hover:underline"
                                    onClick={() => selectStatus('')}
                                >
                                    Tampilkan semua target
                                </button>
                            ) : (
                                <ButtonLink
                                    href={create.url()}
                                    className="rounded-full"
                                >
                                    <Plus className="h-4 w-4" />
                                    Buat target pertama
                                </ButtonLink>
                            )
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
                            {goals.data.map((goal) => (
                                <SavingsGoalCard key={goal.id} goal={goal} />
                            ))}
                        </div>

                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <p className="text-xs font-light text-muted-foreground">
                                Menampilkan {goals.from}–{goals.to} dari{' '}
                                {goals.total} target
                            </p>
                            <Pagination links={goals.links} />
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

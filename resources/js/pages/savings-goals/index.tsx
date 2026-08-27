import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, PiggyBank, Plus, Target, Wallet } from 'lucide-react';

import SummaryCard from '@/components/dashboard/summary-card';
import { SelectField, StatusMessage } from '@/components/form-controls';
import SavingsGoalCard from '@/components/savings-goals/savings-goal-card';
import { ButtonLink } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/formatters';
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
    statusOptions,
}: SavingsGoalIndexProps) {
    const { flash } = usePage().props;
    const hasFilter = filters.status !== null;

    const selectStatus = (status: string) => {
        router.get(
            status === '' ? index.url() : index.url({ query: { status } }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

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
                    className="rounded-full px-4"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Buat Target</span>
                </ButtonLink>
            }
        >
            <Head title="Target Tabungan" />

            <div className="mx-auto grid max-w-6xl gap-5">
                <StatusMessage message={flash.status} />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Target Aktif"
                        value={summary.activeCount.toString()}
                        comparison="Target yang masih berjalan"
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
                        comparison="Hanya dari setoran aktif"
                        icon={<PiggyBank className="h-5 w-5 text-success" />}
                        iconBg="bg-success/10"
                    />
                    <SummaryCard
                        title="Target Selesai"
                        value={summary.completedCount.toString()}
                        comparison="Target yang sudah tercapai"
                        icon={<CheckCircle2 className="h-5 w-5 text-success" />}
                        iconBg="bg-success/10"
                    />
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[var(--control-shadow)] sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-base font-medium text-foreground">
                            Daftar target
                        </h2>
                        <p className="mt-1 text-xs font-light text-muted-foreground">
                            Target terdekat ditampilkan lebih dahulu.
                        </p>
                    </div>
                    <SelectField
                        label="Filter status"
                        name="status"
                        value={filters.status ?? ''}
                        onChange={(event) => selectStatus(event.target.value)}
                        className="min-w-48"
                    >
                        <option value="">Semua status</option>
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                </div>

                {goals.data.length === 0 ? (
                    <EmptyState
                        icon={<Target className="h-7 w-7 text-primary" />}
                        title={
                            hasFilter
                                ? 'Tidak ada target dengan status ini'
                                : 'Belum ada target tabungan'
                        }
                        description={
                            hasFilter
                                ? 'Pilih status lain untuk melihat target yang tersedia.'
                                : 'Buat target pertama untuk mulai mencatat progres tabungan.'
                        }
                        action={
                            hasFilter ? (
                                <button
                                    type="button"
                                    className="text-sm font-medium text-primary hover:underline"
                                    onClick={() => selectStatus('')}
                                >
                                    Reset filter
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

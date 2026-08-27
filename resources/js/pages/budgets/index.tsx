import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Gauge,
    PiggyBank,
    Plus,
    ReceiptText,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

import BudgetCard from '@/components/budgets/budget-card';
import BudgetFormDialog from '@/components/budgets/budget-form-dialog';
import SummaryCard from '@/components/dashboard/summary-card';
import { StatusMessage } from '@/components/form-controls';
import Button from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/formatters';
import { index } from '@/routes/budgets';
import type {
    BudgetListItem,
    BudgetSummary,
    DashboardPeriod,
    PaginatedData,
    SelectOption,
} from '@/types';

type BudgetsIndexProps = {
    period: DashboardPeriod;
    budgets: PaginatedData<BudgetListItem>;
    summary: BudgetSummary;
    categoryOptions: SelectOption[];
};

export default function BudgetsIndex({
    period,
    budgets,
    summary,
    categoryOptions,
}: BudgetsIndexProps) {
    const { flash } = usePage().props;
    const [creating, setCreating] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<BudgetListItem | null>(
        null,
    );
    const canCreate = categoryOptions.length > 0;

    const selectPeriod = (value: string) => {
        router.get(
            index.url({ query: { period: value } }),
            {},
            { preserveScroll: true },
        );
    };

    const closeDialog = () => {
        setCreating(false);
        setSelectedBudget(null);
    };

    return (
        <AppLayout
            title="Budget"
            description="Tetapkan dan pantau batas pengeluaran bulanan."
            breadcrumbs={[{ label: 'Keuangan' }, { label: 'Budget' }]}
            currentPath={index.url()}
            headerActions={
                <Button
                    size="sm"
                    className="rounded-full px-4"
                    disabled={!canCreate}
                    title={
                        canCreate
                            ? 'Buat budget baru'
                            : 'Semua kategori pengeluaran aktif sudah memiliki budget'
                    }
                    onClick={() => setCreating(true)}
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Buat Budget</span>
                </Button>
            }
        >
            <Head title="Budget" />

            <div className="mx-auto grid max-w-6xl gap-5">
                <StatusMessage message={flash.status} />

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-medium text-foreground">
                            Budget {period.label}
                        </h2>
                        <p className="mt-1 text-sm font-light text-muted-foreground">
                            Pemakaian dihitung dari transaksi pengeluaran aktif.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-1.5 shadow-[var(--control-shadow)]">
                        <button
                            type="button"
                            aria-label="Bulan sebelumnya"
                            onClick={() => selectPeriod(period.previous)}
                            className="rounded-xl p-2 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <input
                            type="month"
                            value={period.value}
                            aria-label="Pilih bulan budget"
                            onChange={(event) =>
                                selectPeriod(event.target.value)
                            }
                            className="h-9 rounded-xl border-0 bg-transparent px-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                            type="button"
                            aria-label="Bulan berikutnya"
                            onClick={() => selectPeriod(period.next)}
                            className="rounded-xl p-2 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Budget"
                        value={formatRupiah(summary.allocated)}
                        comparison={`${budgets.total} kategori pada bulan ini`}
                        icon={<Wallet className="h-5 w-5 text-primary" />}
                        iconBg="bg-primary-soft"
                    />
                    <SummaryCard
                        title="Total Terpakai"
                        value={formatRupiah(summary.spent)}
                        comparison="Dari transaksi pengeluaran aktif"
                        icon={<ReceiptText className="h-5 w-5 text-warning" />}
                        iconBg="bg-warning/10"
                    />
                    <SummaryCard
                        title={
                            summary.remaining >= 0 ? 'Total Sisa' : 'Kelebihan'
                        }
                        value={formatRupiah(Math.abs(summary.remaining))}
                        comparison={
                            summary.remaining >= 0
                                ? 'Budget yang belum terpakai'
                                : 'Pengeluaran melewati total budget'
                        }
                        icon={
                            <PiggyBank
                                className={`h-5 w-5 ${summary.remaining >= 0 ? 'text-success' : 'text-danger'}`}
                            />
                        }
                        iconBg={
                            summary.remaining >= 0
                                ? 'bg-success/10'
                                : 'bg-danger/10'
                        }
                    />
                    <SummaryCard
                        title="Pemakaian"
                        value={`${summary.percentage}%`}
                        comparison={`${summary.overBudgetCount} kategori melebihi budget`}
                        icon={<Gauge className="h-5 w-5 text-accent" />}
                        iconBg="bg-accent-soft"
                    />
                </div>

                {budgets.data.length === 0 ? (
                    <EmptyState
                        icon={<Wallet className="h-7 w-7 text-primary" />}
                        title="Belum ada budget bulan ini"
                        description={
                            canCreate
                                ? 'Buat budget untuk mulai mengendalikan pengeluaran per kategori.'
                                : 'Tambahkan kategori pengeluaran aktif terlebih dahulu sebelum membuat budget.'
                        }
                        action={
                            canCreate ? (
                                <Button
                                    className="rounded-full"
                                    onClick={() => setCreating(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Buat budget pertama
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
                            {budgets.data.map((budget) => (
                                <BudgetCard
                                    key={budget.id}
                                    budget={budget}
                                    onEdit={() => setSelectedBudget(budget)}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <p className="text-xs font-light text-muted-foreground">
                                Menampilkan {budgets.from}–{budgets.to} dari{' '}
                                {budgets.total} budget
                            </p>
                            <Pagination links={budgets.links} />
                        </div>
                    </>
                )}
            </div>

            <BudgetFormDialog
                open={creating || selectedBudget !== null}
                period={period}
                categoryOptions={categoryOptions}
                budget={selectedBudget}
                onClose={closeDialog}
            />
        </AppLayout>
    );
}

import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Flame,
    Gauge,
    Layers,
    PiggyBank,
    Plus,
    ReceiptText,
    Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import BudgetCard from '@/components/budgets/budget-card';
import BudgetFormDialog from '@/components/budgets/budget-form-dialog';
import SummaryCard from '@/components/dashboard/summary-card';
import { StatusMessage } from '@/components/form-controls';
import Button from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { index } from '@/routes/budgets';
import type {
    BudgetCategoryOption,
    BudgetListItem,
    BudgetSummary,
    DashboardPeriod,
    PaginatedData,
} from '@/types';

type BudgetsIndexProps = {
    period: DashboardPeriod;
    budgets: PaginatedData<BudgetListItem>;
    summary: BudgetSummary;
    categoryOptions: BudgetCategoryOption[];
};

export default function BudgetsIndex({
    period,
    budgets,
    summary,
    categoryOptions,
}: BudgetsIndexProps) {
    const { flash } = usePage().props;
    const [creating, setCreating] = useState(false);
    const [preselectedCategoryId, setPreselectedCategoryId] = useState<
        string | null
    >(null);
    const [selectedBudget, setSelectedBudget] = useState<BudgetListItem | null>(
        null,
    );
    const [statusFilter, setStatusFilter] = useState<
        'all' | 'safe' | 'warning' | 'over'
    >('all');

    const canCreate = categoryOptions.length > 0;

    const visibleBudgets = useMemo(() => {
        if (statusFilter === 'all') {
            return budgets.data;
        }

        if (statusFilter === 'warning') {
            return budgets.data.filter(
                (item) =>
                    item.status === 'warning' || item.status === 'reached',
            );
        }

        return budgets.data.filter((item) => item.status === statusFilter);
    }, [budgets.data, statusFilter]);

    const selectPeriod = (value: string) => {
        router.get(
            index.url({ query: { period: value } }),
            {},
            { preserveScroll: true },
        );
    };

    const openCreateForCategory = (categoryId?: string) => {
        setPreselectedCategoryId(
            categoryId ?? categoryOptions[0]?.value ?? null,
        );
        setCreating(true);
    };

    const closeDialog = () => {
        setCreating(false);
        setPreselectedCategoryId(null);
        setSelectedBudget(null);
    };

    const statusTabs = [
        {
            value: 'all' as const,
            label: 'Semua',
            icon: Layers,
            activeClass:
                'border-primary/40 bg-primary-soft text-primary shadow-[var(--control-shadow-active)]',
        },
        {
            value: 'safe' as const,
            label: 'Aman',
            icon: CheckCircle2,
            activeClass:
                'border-success/40 bg-success/10 text-success shadow-[var(--control-shadow-active)]',
        },
        {
            value: 'warning' as const,
            label: 'Mendekati Batas',
            icon: AlertTriangle,
            activeClass:
                'border-warning/40 bg-warning/10 text-warning shadow-[var(--control-shadow-active)]',
        },
        {
            value: 'over' as const,
            label: 'Melebihi Budget',
            icon: Flame,
            activeClass:
                'border-danger/40 bg-danger/10 text-danger shadow-[var(--control-shadow-active)]',
        },
    ];

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
                    onClick={() => openCreateForCategory()}
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Buat Budget</span>
                </Button>
            }
        >
            <Head title="Budget" />

            <div className="grid w-full gap-5">
                <StatusMessage message={flash.status} />

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-medium text-foreground">
                                Budget {period.label}
                            </h2>
                            {period.rangeLabel && (
                                <span className="rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                                    Siklus: {period.rangeLabel}
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-sm font-light text-muted-foreground">
                            Pemakaian dihitung dari transaksi pengeluaran aktif
                            pada rentang siklus ini.
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

                {canCreate && (
                    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/15 bg-primary-soft/50 px-4 py-3">
                        <span className="text-xs font-medium text-foreground-secondary">
                            Belum diatur bulan ini:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {categoryOptions.map((category) => (
                                <button
                                    key={category.value}
                                    type="button"
                                    onClick={() =>
                                        openCreateForCategory(category.value)
                                    }
                                    className="inline-flex items-center gap-1 rounded-xl border border-primary/25 bg-surface px-2.5 py-1 text-xs font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary-soft active:scale-95"
                                >
                                    <Plus className="h-3 w-3" />
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {budgets.data.length === 0 ? (
                    <EmptyState
                        icon={<Wallet className="h-7 w-7 text-primary" />}
                        title="Belum ada budget bulan ini"
                        description={
                            canCreate
                                ? 'Pilih salah satu kategori di atas atau tekan tombol di bawah untuk mulai mengatur budget.'
                                : 'Tambahkan kategori pengeluaran aktif terlebih dahulu sebelum membuat budget.'
                        }
                        action={
                            canCreate ? (
                                <Button
                                    className="rounded-full"
                                    onClick={() => openCreateForCategory()}
                                >
                                    <Plus className="h-4 w-4" />
                                    Buat budget pertama
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div
                                role="tablist"
                                aria-label="Filter status budget"
                                className="grid w-full grid-cols-2 gap-1.5 rounded-2xl border border-[var(--control-border)] bg-surface/80 p-1.5 sm:inline-grid sm:w-auto sm:grid-cols-4"
                            >
                                {statusTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const active = statusFilter === tab.value;

                                    return (
                                        <button
                                            key={tab.value}
                                            type="button"
                                            role="tab"
                                            aria-selected={active}
                                            onClick={() =>
                                                setStatusFilter(tab.value)
                                            }
                                            className={cn(
                                                'flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                                                active
                                                    ? tab.activeClass
                                                    : 'border-transparent text-foreground-secondary hover:bg-surface-muted hover:text-foreground',
                                            )}
                                        >
                                            <Icon className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">
                                                {tab.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {visibleBudgets.map((budget) => (
                                <BudgetCard
                                    key={budget.id}
                                    budget={budget}
                                    periodStart={period.startDate}
                                    periodEnd={period.endDate}
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
                key={
                    selectedBudget?.id ??
                    `create-${preselectedCategoryId ?? 'none'}-${creating ? 'open' : 'closed'}`
                }
                open={creating || selectedBudget !== null}
                period={period}
                categoryOptions={categoryOptions}
                budget={selectedBudget}
                initialCategoryId={preselectedCategoryId}
                onClose={closeDialog}
            />
        </AppLayout>
    );
}

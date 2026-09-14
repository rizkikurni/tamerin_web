import { Head, usePage } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    DollarSign,
    Plus,
    TrendingUp,
    WalletCards,
} from 'lucide-react';

import AccountSummary from '@/components/dashboard/account-summary';
import BudgetProgress from '@/components/dashboard/budget-progress';
import CashFlowChart from '@/components/dashboard/cash-flow-chart';
import { DashboardPeriodPicker } from '@/components/dashboard/dashboard-header';
import InvestmentSummary from '@/components/dashboard/investment-summary';
import NetWorthCard from '@/components/dashboard/net-worth-card';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import SavingsSummary from '@/components/dashboard/savings-summary';
import SummaryCard from '@/components/dashboard/summary-card';
import { ButtonLink } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/formatters';
import { dashboard } from '@/routes';
import { create as createAccount } from '@/routes/financial-accounts';
import type { DashboardProps } from '@/types';

function comparisonLabel(
    value: number | null,
    subject: 'Pemasukan' | 'Pengeluaran',
): string {
    if (value === null) {
        return `Belum ada pembanding ${subject.toLowerCase()}`;
    }

    const prefix = value > 0 ? '+' : '';

    return `${prefix}${value}% dari bulan lalu`;
}

export default function DashboardIndex({
    period,
    summary,
    cashFlow,
    accounts,
    budgets,
    recentTransactions,
    netWorth,
    secondary,
    isNewUser,
}: DashboardProps) {
    const { auth } = usePage().props;

    return (
        <AppLayout
            title="Dashboard"
            description="Ringkasan kondisi keuanganmu."
            breadcrumbs={[{ label: 'Ringkasan' }, { label: 'Dashboard' }]}
            currentPath={dashboard.url()}
            headerTitle={`Selamat datang, ${auth.user?.name ?? 'Pengguna'}`}
            headerActions={
                <DashboardPeriodPicker
                    key={period.value}
                    period={period}
                    className="dashboard-navbar-period"
                    popupAlign="right"
                    showChevron={false}
                />
            }
        >
            <Head title="Dashboard" />

            <div className="relative overflow-hidden">
                <div className="relative z-10 w-full space-y-3 dark:space-y-6">
                    {isNewUser && (
                        <EmptyState
                            icon={
                                <WalletCards className="h-7 w-7 text-primary" />
                            }
                            title="Mulai catat keuanganmu"
                            description="Dashboard akan terisi otomatis setelah sumber dana dan transaksi pertamamu tersedia."
                            steps={[
                                'Tambahkan akun keuangan',
                                'Catat pemasukan atau pengeluaran',
                                'Pantau ringkasan pada dashboard',
                            ]}
                            action={
                                <ButtonLink
                                    href={createAccount.url()}
                                    className="rounded-full"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah akun pertama
                                </ButtonLink>
                            }
                        />
                    )}

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 dark:gap-4">
                        <SummaryCard
                            title="Total Saldo"
                            value={formatRupiah(summary.totalBalance)}
                            comparison={`Dari ${summary.activeAccountCount} akun aktif`}
                            icon={
                                <DollarSign className="h-5 w-5 text-primary" />
                            }
                            iconBg="bg-primary-soft"
                        />
                        <SummaryCard
                            title="Pemasukan"
                            value={formatRupiah(summary.income)}
                            comparison={comparisonLabel(
                                summary.incomeComparison,
                                'Pemasukan',
                            )}
                            icon={
                                <ArrowDownLeft className="h-5 w-5 text-success" />
                            }
                            iconBg="bg-success/10"
                        />
                        <SummaryCard
                            title="Pengeluaran"
                            value={formatRupiah(summary.expense)}
                            comparison={comparisonLabel(
                                summary.expenseComparison,
                                'Pengeluaran',
                            )}
                            icon={
                                <ArrowUpRight className="h-5 w-5 text-danger" />
                            }
                            iconBg="bg-danger/10"
                        />
                        <SummaryCard
                            title="Arus Kas Bersih"
                            value={formatRupiah(summary.netCashFlow)}
                            comparison="Pemasukan − Pengeluaran"
                            icon={
                                <TrendingUp className="h-5 w-5 text-accent" />
                            }
                            iconBg="bg-accent-soft"
                        />
                    </div>

                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)] dark:gap-6 dark:lg:grid-cols-12 dark:xl:grid-cols-12">
                        <div className="dark:lg:col-span-8">
                            <CashFlowChart data={cashFlow} />
                        </div>
                        <div className="dark:lg:col-span-4">
                            <NetWorthCard netWorth={netWorth} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 dark:gap-6 dark:lg:grid-cols-2">
                        <AccountSummary accounts={accounts} />
                        <BudgetProgress budgets={budgets} />
                    </div>

                    <RecentTransactions transactions={recentTransactions} />

                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 dark:gap-6 dark:lg:grid-cols-2">
                        <SavingsSummary goal={secondary.savingsGoal} />
                        <InvestmentSummary investment={secondary.investment} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

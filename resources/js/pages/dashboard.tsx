import {
    ArrowDownLeft,
    ArrowUpRight,
    DollarSign,
    TrendingUp,
} from 'lucide-react';

import AccountSummary from '@/components/dashboard/account-summary';
import BudgetProgress from '@/components/dashboard/budget-progress';
import CashFlowChart from '@/components/dashboard/cash-flow-chart';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import InvestmentSummary from '@/components/dashboard/investment-summary';
import NetWorthCard from '@/components/dashboard/net-worth-card';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import SavingsSummary from '@/components/dashboard/savings-summary';
import SummaryCard from '@/components/dashboard/summary-card';
import SystemReminders from '@/components/dashboard/system-reminders';
import AppLayout from '@/layouts/app-layout';

// --- Dummy data (akan diganti di Fase 8) ---

const summary = {
    totalBalance: 12500000,
    income: 5000000,
    expense: 3200000,
    netCashFlow: 1800000,
};

// --- Helper ---

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

// --- Page ---

export default function Dashboard() {
    return (
        <AppLayout
            title="Dashboard"
            description="Ringkasan kondisi keuanganmu."
            breadcrumbs={[{ label: 'Ringkasan' }, { label: 'Dashboard' }]}
            currentPath="/dashboard"
        >
            {/* Background Glow */}
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-0">
                    {/* Glow kiri atas */}
                    <div
                        className="
                            absolute
                            -left-40
                            -top-40
                            h-[500px]
                            w-[500px]
                            rounded-full
                            bg-blue-400/20
                            blur-[120px]
                        "
                    />

                    {/* Glow kanan tengah */}
                    <div
                        className="
                            absolute
                            -right-40
                            top-[30%]
                            h-[550px]
                            w-[550px]
                            rounded-full
                            bg-blue-300/20
                            blur-[130px]
                        "
                    />

                    {/* Glow bawah */}
                    <div
                        className="
                            absolute
                            bottom-0
                            left-[20%]
                            h-[450px]
                            w-[450px]
                            rounded-full
                            bg-indigo-300/15
                            blur-[120px]
                        "
                    />
                </div>

                {/* Dashboard Content */}
                <div className="relative z-10 space-y-6">
                    <DashboardHeader userName="Rizki" />

                    {/* Summary Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            title="Total Saldo"
                            value={formatRupiah(summary.totalBalance)}
                            comparison="Dari 5 akun keuangan"
                            icon={
                                <DollarSign className="h-5 w-5 text-primary" />
                            }
                            iconBg="bg-primary-soft"
                        />

                        <SummaryCard
                            title="Pemasukan"
                            value={formatRupiah(summary.income)}
                            comparison="+12% dari bulan lalu"
                            icon={
                                <ArrowDownLeft className="h-5 w-5 text-success" />
                            }
                            iconBg="bg-success/10"
                        />

                        <SummaryCard
                            title="Pengeluaran"
                            value={formatRupiah(summary.expense)}
                            comparison="-5% dari bulan lalu"
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

                    {/* Row 1 */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <CashFlowChart />
                        </div>

                        <div className="lg:col-span-4">
                            <NetWorthCard />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-6">
                            <AccountSummary />
                        </div>

                        <div className="lg:col-span-6">
                            <BudgetProgress />
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <RecentTransactions />
                        </div>

                        <div className="lg:col-span-4">
                            <SystemReminders />
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-6">
                            <SavingsSummary />
                        </div>

                        <div className="lg:col-span-6">
                            <InvestmentSummary />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, usePage } from '@inertiajs/react';
import { ArrowDownLeft, ArrowUpRight, Plus, TrendingUp } from 'lucide-react';

import SummaryCard from '@/components/dashboard/summary-card';
import { StatusMessage } from '@/components/form-controls';
import { formatRupiah } from '@/components/transactions/transaction-display';
import TransactionFiltersForm from '@/components/transactions/transaction-filters';
import TransactionList from '@/components/transactions/transaction-list';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { create, index } from '@/routes/transactions';
import type {
    PaginatedData,
    TransactionFilterOptions,
    TransactionFilters,
    TransactionListItem,
    TransactionSummary,
} from '@/types';

type TransactionsIndexProps = {
    transactions: PaginatedData<TransactionListItem>;
    summary: TransactionSummary;
    filters: TransactionFilters;
    filterOptions: TransactionFilterOptions;
};

export default function TransactionsIndex({
    transactions,
    summary,
    filters,
    filterOptions,
}: TransactionsIndexProps) {
    const { flash } = usePage().props;

    return (
        <AppLayout
            title="Transaksi"
            description="Riwayat pemasukan, pengeluaran, dan transfer antar akun."
            breadcrumbs={[{ label: 'Keuangan' }, { label: 'Transaksi' }]}
            currentPath={index.url()}
            headerActions={
                <ButtonLink
                    href={create.url()}
                    size="sm"
                    className="rounded-full px-4"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Catat Transaksi</span>
                </ButtonLink>
            }
        >
            <Head title="Transaksi" />

            <div className="grid w-full gap-4">
                <StatusMessage message={flash.status} />

                <div className="grid gap-3 sm:grid-cols-3">
                    <SummaryCard
                        title="Total Pemasukan"
                        value={formatRupiah(summary.totalIncome)}
                        comparison="Transaksi tercatat sesuai filter"
                        icon={
                            <ArrowDownLeft className="h-5 w-5 text-success" />
                        }
                        iconBg="bg-success/10"
                    />
                    <SummaryCard
                        title="Total Pengeluaran"
                        value={formatRupiah(summary.totalExpense)}
                        comparison="Transaksi tercatat sesuai filter"
                        icon={<ArrowUpRight className="h-5 w-5 text-danger" />}
                        iconBg="bg-danger/10"
                    />
                    <SummaryCard
                        title="Arus Kas Bersih"
                        value={formatRupiah(summary.netCashFlow)}
                        comparison={`Dari ${summary.transactionCount} transaksi ditemukan`}
                        icon={<TrendingUp className="h-5 w-5 text-primary" />}
                        iconBg="bg-primary-soft"
                    />
                </div>

                <Card variant="navbar">
                    <CardContent className="p-3.5 sm:p-4">
                        <TransactionFiltersForm
                            filters={filters}
                            options={filterOptions}
                        />
                    </CardContent>
                </Card>

                <TransactionList transactions={transactions} />
            </div>
        </AppLayout>
    );
}

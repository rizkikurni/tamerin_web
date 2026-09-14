import { Head, usePage } from '@inertiajs/react';
import { Filter, Plus } from 'lucide-react';

import { StatusMessage } from '@/components/form-controls';
import TransactionFiltersForm from '@/components/transactions/transaction-filters';
import TransactionList from '@/components/transactions/transaction-list';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { create, index } from '@/routes/transactions';
import type {
    PaginatedData,
    TransactionFilterOptions,
    TransactionFilters,
    TransactionListItem,
} from '@/types';

type TransactionsIndexProps = {
    transactions: PaginatedData<TransactionListItem>;
    filters: TransactionFilters;
    filterOptions: TransactionFilterOptions;
};

export default function TransactionsIndex({
    transactions,
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

                <Card variant="navbar">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                <Filter className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-foreground">
                                    Filter transaksi
                                </h2>
                                <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                    Saring berdasarkan periode dan data terkait.
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
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

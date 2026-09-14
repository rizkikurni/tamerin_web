import { Head } from '@inertiajs/react';
import { ReceiptText } from 'lucide-react';

import { store } from '@/actions/App/Http/Controllers/TransactionController';
import TransactionForm from '@/components/transactions/transaction-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/transactions';
import type {
    SelectOption,
    TransactionAccountOption,
    TransactionCategoryOption,
} from '@/types';

type CreateTransactionProps = {
    transactionTypes: SelectOption[];
    accounts: TransactionAccountOption[];
    categories: TransactionCategoryOption[];
    idempotencyKey: string;
    defaultDate: string;
};

export default function CreateTransaction({
    transactionTypes,
    accounts,
    categories,
    idempotencyKey,
    defaultDate,
}: CreateTransactionProps) {
    return (
        <AppLayout
            title="Catat Transaksi"
            description="Tambahkan pemasukan, pengeluaran, atau transfer antar akun."
            breadcrumbs={[
                { label: 'Keuangan' },
                { label: 'Transaksi', href: index.url() },
                { label: 'Tambah' },
            ]}
            currentPath={index.url()}
        >
            <Head title="Catat Transaksi" />

            <Card variant="navbar">
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                            <ReceiptText className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-base font-medium text-foreground">
                                Informasi transaksi
                            </h1>
                            <p className="mt-1 text-sm font-light text-muted-foreground">
                                Transaksi yang tersimpan tidak dapat diedit atau
                                dihapus permanen.
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <TransactionForm
                        form={store.form()}
                        transactionTypes={transactionTypes}
                        accounts={accounts}
                        categories={categories}
                        idempotencyKey={idempotencyKey}
                        defaultDate={defaultDate}
                        cancelUrl={index.url()}
                    />
                </CardContent>
            </Card>
        </AppLayout>
    );
}

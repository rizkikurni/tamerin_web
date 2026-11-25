import { Head } from '@inertiajs/react';
import { ArrowLeft, WalletCards } from 'lucide-react';

import { store } from '@/actions/App/Http/Controllers/FinancialAccountController';
import FinancialAccountForm from '@/components/financial-accounts/financial-account-form';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/financial-accounts';
import type { SelectOption } from '@/types';

export default function CreateFinancialAccount({
    accountTypes,
    defaultOpenedOn,
}: {
    accountTypes: SelectOption[];
    defaultOpenedOn?: string;
}) {
    return (
        <AppLayout
            title="Tambah Akun Keuangan"
            description="Catat sumber dana yang akan digunakan untuk transaksi."
            breadcrumbs={[
                { label: 'Keuangan' },
                { label: 'Akun Keuangan', href: index.url() },
                { label: 'Tambah' },
            ]}
            currentPath={index.url()}
        >
            <Head title="Tambah Akun Keuangan" />

            <div className="grid w-full gap-4">
                <div>
                    <ButtonLink
                        href={index.url()}
                        variant="outline"
                        size="sm"
                        className="rounded-full px-3.5 shadow-[var(--control-shadow)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Akun Keuangan</span>
                    </ButtonLink>
                </div>

                <Card variant="navbar">
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                                <WalletCards className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-base font-medium text-foreground">
                                    Informasi akun
                                </h1>
                                <p className="mt-1 text-sm font-light text-muted-foreground">
                                    Pilih tipe akun, gunakan saran nama cepat,
                                    dan isi saldo awalnya.
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <FinancialAccountForm
                            form={store.form()}
                            accountTypes={accountTypes}
                            defaultOpenedOn={defaultOpenedOn}
                            cancelUrl={index.url()}
                            submitLabel="Simpan Akun"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Head } from '@inertiajs/react';
import { WalletCards } from 'lucide-react';

import { update } from '@/actions/App/Http/Controllers/FinancialAccountController';
import FinancialAccountForm from '@/components/financial-accounts/financial-account-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/financial-accounts';
import type { FinancialAccountFormData, SelectOption } from '@/types';

type EditFinancialAccountProps = {
    account: FinancialAccountFormData;
    accountTypes: SelectOption[];
};

export default function EditFinancialAccount({
    account,
    accountTypes,
}: EditFinancialAccountProps) {
    return (
        <AppLayout
            title="Edit Akun Keuangan"
            description="Perbarui informasi akun yang masih aktif."
            breadcrumbs={[
                { label: 'Keuangan' },
                { label: 'Akun Keuangan', href: index.url() },
                { label: 'Edit' },
            ]}
            currentPath={index.url()}
        >
            <Head title={`Edit ${account.name}`} />

            <Card>
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
                                Perubahan tidak menghapus histori akun.
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <FinancialAccountForm
                        form={update.form.patch(account.id)}
                        accountTypes={accountTypes}
                        cancelUrl={index.url()}
                        account={account}
                        submitLabel="Simpan Perubahan"
                    />
                </CardContent>
            </Card>
        </AppLayout>
    );
}

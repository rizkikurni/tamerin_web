import { Head } from '@inertiajs/react';

import InvestmentForm from '@/components/investments/investment-form';
import AppLayout from '@/layouts/app-layout';
import { index, show } from '@/routes/investments';
import type { InvestmentFormData, SelectOption } from '@/types';

export default function InvestmentEdit({
    investment,
    instrumentOptions,
}: {
    investment: InvestmentFormData;
    instrumentOptions: SelectOption[];
}) {
    return (
        <AppLayout
            title="Ubah Investasi"
            description="Perbarui informasi holding tanpa mengubah histori valuasi."
            breadcrumbs={[
                { label: 'Kekayaan' },
                { label: 'Investasi', href: index.url() },
                {
                    label: investment.name,
                    href: show.url(investment.id),
                },
                { label: 'Ubah' },
            ]}
            currentPath={index.url()}
        >
            <Head title={`Ubah ${investment.name}`} />
            <div className="w-full">
                <InvestmentForm
                    investment={investment}
                    instrumentOptions={instrumentOptions}
                />
            </div>
        </AppLayout>
    );
}

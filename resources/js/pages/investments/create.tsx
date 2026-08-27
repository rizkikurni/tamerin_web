import { Head } from '@inertiajs/react';

import InvestmentForm from '@/components/investments/investment-form';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/investments';
import type { SelectOption } from '@/types';

export default function InvestmentCreate({
    instrumentOptions,
    defaultAcquiredOn,
}: {
    instrumentOptions: SelectOption[];
    defaultAcquiredOn: string;
}) {
    return (
        <AppLayout
            title="Tambah Investasi"
            description="Catat holding investasi dan modal perolehannya."
            breadcrumbs={[
                { label: 'Kekayaan' },
                { label: 'Investasi', href: index.url() },
                { label: 'Tambah' },
            ]}
            currentPath={index.url()}
        >
            <Head title="Tambah Investasi" />
            <div className="mx-auto max-w-3xl">
                <InvestmentForm
                    instrumentOptions={instrumentOptions}
                    defaultAcquiredOn={defaultAcquiredOn}
                />
            </div>
        </AppLayout>
    );
}

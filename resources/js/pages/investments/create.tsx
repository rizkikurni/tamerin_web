import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import InvestmentForm from '@/components/investments/investment-form';
import { ButtonLink } from '@/components/ui/button';
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
            <div className="grid w-full gap-4">
                <div>
                    <ButtonLink
                        href={index.url()}
                        variant="outline"
                        size="sm"
                        className="rounded-full px-3.5 shadow-[var(--control-shadow)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Investasi</span>
                    </ButtonLink>
                </div>

                <InvestmentForm
                    instrumentOptions={instrumentOptions}
                    defaultAcquiredOn={defaultAcquiredOn}
                />
            </div>
        </AppLayout>
    );
}

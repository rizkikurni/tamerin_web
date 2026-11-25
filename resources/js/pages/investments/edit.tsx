import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import InvestmentForm from '@/components/investments/investment-form';
import { ButtonLink } from '@/components/ui/button';
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
            <div className="grid w-full gap-4">
                <div>
                    <ButtonLink
                        href={show.url(investment.id)}
                        variant="outline"
                        size="sm"
                        className="rounded-full px-3.5 shadow-[var(--control-shadow)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Detail Investasi</span>
                    </ButtonLink>
                </div>

                <InvestmentForm
                    investment={investment}
                    instrumentOptions={instrumentOptions}
                />
            </div>
        </AppLayout>
    );
}

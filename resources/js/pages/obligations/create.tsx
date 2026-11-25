import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import ObligationForm from '@/components/obligations/obligation-form';
import { ButtonLink } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/obligations';
import type { SelectOption } from '@/types';

export default function ObligationCreate({
    kindOptions,
    defaultStartedOn,
}: {
    kindOptions: SelectOption[];
    defaultStartedOn: string;
}) {
    return (
        <AppLayout
            title="Tambah Utang atau Piutang"
            description="Catat kewajiban baru beserta pihak dan jatuh temponya."
            breadcrumbs={[
                { label: 'Kekayaan' },
                { label: 'Utang & Piutang', href: index.url() },
                { label: 'Tambah' },
            ]}
            currentPath={index.url()}
        >
            <Head title="Tambah Utang atau Piutang" />
            <div className="grid w-full gap-4">
                <div>
                    <ButtonLink
                        href={index.url()}
                        variant="outline"
                        size="sm"
                        className="rounded-full px-3.5 shadow-[var(--control-shadow)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Utang & Piutang</span>
                    </ButtonLink>
                </div>

                <ObligationForm
                    kindOptions={kindOptions}
                    defaultStartedOn={defaultStartedOn}
                />
            </div>
        </AppLayout>
    );
}

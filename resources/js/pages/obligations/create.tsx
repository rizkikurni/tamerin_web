import { Head } from '@inertiajs/react';

import ObligationForm from '@/components/obligations/obligation-form';
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
            <div className="w-full">
                <ObligationForm
                    kindOptions={kindOptions}
                    defaultStartedOn={defaultStartedOn}
                />
            </div>
        </AppLayout>
    );
}

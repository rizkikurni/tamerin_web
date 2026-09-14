import { Head } from '@inertiajs/react';

import ObligationForm from '@/components/obligations/obligation-form';
import AppLayout from '@/layouts/app-layout';
import { index, show } from '@/routes/obligations';
import type { ObligationFormData, SelectOption } from '@/types';

export default function ObligationEdit({
    obligation,
    kindOptions,
}: {
    obligation: ObligationFormData;
    kindOptions: SelectOption[];
}) {
    return (
        <AppLayout
            title="Ubah Utang atau Piutang"
            description="Perbarui informasi catatan tanpa menghapus riwayat pembayaran."
            breadcrumbs={[
                { label: 'Kekayaan' },
                { label: 'Utang & Piutang', href: index.url() },
                {
                    label: obligation.counterparty_name,
                    href: show.url(obligation.id),
                },
                { label: 'Ubah' },
            ]}
            currentPath={index.url()}
        >
            <Head title={`Ubah ${obligation.counterparty_name}`} />
            <div className="w-full">
                <ObligationForm
                    obligation={obligation}
                    kindOptions={kindOptions}
                />
            </div>
        </AppLayout>
    );
}

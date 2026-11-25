import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import ObligationForm from '@/components/obligations/obligation-form';
import { ButtonLink } from '@/components/ui/button';
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
            <div className="grid w-full gap-4">
                <div>
                    <ButtonLink
                        href={show.url(obligation.id)}
                        variant="outline"
                        size="sm"
                        className="rounded-full px-3.5 shadow-[var(--control-shadow)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Detail</span>
                    </ButtonLink>
                </div>

                <ObligationForm
                    obligation={obligation}
                    kindOptions={kindOptions}
                />
            </div>
        </AppLayout>
    );
}

import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import SavingsGoalForm from '@/components/savings-goals/savings-goal-form';
import { ButtonLink } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { edit, index, show } from '@/routes/savings-goals';
import type { SavingsGoalFormData } from '@/types';

export default function SavingsGoalEdit({
    goal,
}: {
    goal: SavingsGoalFormData;
}) {
    return (
        <AppLayout
            title="Ubah Target Tabungan"
            description="Perbarui nama, nominal, atau tanggal target."
            breadcrumbs={[
                { label: 'Kekayaan' },
                { label: 'Target Tabungan', href: index.url() },
                { label: goal.name, href: show.url(goal.id) },
                { label: 'Ubah' },
            ]}
            currentPath={edit.url(goal.id)}
        >
            <Head title={`Ubah ${goal.name}`} />

            <div className="grid w-full gap-4">
                <div>
                    <ButtonLink
                        href={show.url(goal.id)}
                        variant="outline"
                        size="sm"
                        className="rounded-full px-3.5 shadow-[var(--control-shadow)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Detail Target</span>
                    </ButtonLink>
                </div>

                <SavingsGoalForm goal={goal} />
            </div>
        </AppLayout>
    );
}

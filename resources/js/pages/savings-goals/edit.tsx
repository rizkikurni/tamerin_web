import { Head } from '@inertiajs/react';

import SavingsGoalForm from '@/components/savings-goals/savings-goal-form';
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

            <div className="w-full">
                <SavingsGoalForm goal={goal} />
            </div>
        </AppLayout>
    );
}

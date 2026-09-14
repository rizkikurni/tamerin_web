import { Head } from '@inertiajs/react';

import SavingsGoalForm from '@/components/savings-goals/savings-goal-form';
import AppLayout from '@/layouts/app-layout';
import { create, index } from '@/routes/savings-goals';

export default function SavingsGoalCreate() {
    return (
        <AppLayout
            title="Buat Target Tabungan"
            description="Mulai rencana menabung dengan target yang terukur."
            breadcrumbs={[
                { label: 'Kekayaan' },
                { label: 'Target Tabungan', href: index.url() },
                { label: 'Buat' },
            ]}
            currentPath={create.url()}
        >
            <Head title="Buat Target Tabungan" />

            <div className="w-full">
                <SavingsGoalForm />
            </div>
        </AppLayout>
    );
}

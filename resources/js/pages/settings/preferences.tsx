import { Head, usePage } from '@inertiajs/react';
import { Palette } from 'lucide-react';

import { StatusMessage } from '@/components/form-controls';
import SettingsPanel from '@/components/settings/settings-panel';
import ThemeSettings from '@/components/settings/theme-settings';
import AppLayout from '@/layouts/app-layout';
import { edit as preferencesEdit } from '@/routes/preferences';

interface PreferencesPageProps {
    preferences?: {
        financial_cycle_start_day?: number;
        timezone?: string;
    };
}

export default function Preferences({ preferences }: PreferencesPageProps) {
    const { flash } = usePage().props;

    return (
        <AppLayout
            title="Preferensi"
            description="Atur tampilan, siklus keuangan, dan zona waktu akun Anda."
            breadcrumbs={[{ label: 'Pengaturan' }, { label: 'Preferensi' }]}
            currentPath={preferencesEdit.url()}
        >
            <Head title="Preferensi" />

            <div className="grid w-full gap-4">
                <StatusMessage message={flash.status} />

                <SettingsPanel
                    title="Tampilan & Siklus Keuangan"
                    description="Pilih mode tampilan, tema warna, serta tanggal mulai siklus keuangan bulanan Anda."
                    icon={Palette}
                >
                    <ThemeSettings
                        initialCycleStartDay={
                            preferences?.financial_cycle_start_day ?? 1
                        }
                        initialTimezone={
                            preferences?.timezone ?? 'Asia/Jakarta'
                        }
                    />
                </SettingsPanel>
            </div>
        </AppLayout>
    );
}

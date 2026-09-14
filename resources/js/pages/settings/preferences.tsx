import { Head, usePage } from '@inertiajs/react';
import { Palette } from 'lucide-react';

import { StatusMessage } from '@/components/form-controls';
import SettingsPanel from '@/components/settings/settings-panel';
import ThemeSettings from '@/components/settings/theme-settings';
import AppLayout from '@/layouts/app-layout';
import { edit as preferencesEdit } from '@/routes/preferences';

export default function Preferences() {
    const { flash } = usePage().props;

    return (
        <AppLayout
            title="Preferensi"
            description="Atur tampilan dan zona waktu akun Anda."
            breadcrumbs={[{ label: 'Pengaturan' }, { label: 'Preferensi' }]}
            currentPath={preferencesEdit.url()}
        >
            <Head title="Preferensi" />

            <div className="grid w-full gap-4">
                <StatusMessage message={flash.status} />

                <SettingsPanel
                    title="Tampilan"
                    description="Pilih mode, tema, dan warna yang nyaman untuk Anda."
                    icon={Palette}
                >
                    <ThemeSettings />
                </SettingsPanel>
            </div>
        </AppLayout>
    );
}

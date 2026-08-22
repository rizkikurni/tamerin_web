import { Head, usePage } from '@inertiajs/react';

import ThemeSettings from '@/components/settings/theme-settings';
import AppLayout from '@/layouts/app-layout';

interface PreferencesPageProps {
    preferences?: {
        theme_mode: string;
        theme_preset: string;
        primary_hex: string | null;
        secondary_hex: string | null;
        accent_hex: string | null;
        timezone: string;
    };
}

export default function Preferences({ preferences }: PreferencesPageProps) {
    const { flash } = usePage().props;

    return (
        <AppLayout
            title="Preferensi"
            description="Atur tampilan dan zona waktu akun Anda."
            breadcrumbs={[
                { label: 'Pengaturan', href: '/settings/profile' },
                { label: 'Preferensi' },
            ]}
            currentPath="/settings"
        >
            <Head title="Preferensi" />

            <div className="mx-auto max-w-3xl space-y-4">
                {flash?.status === 'preferences-updated' && (
                    <div className="rounded-2xl bg-success/10 p-4 text-sm font-medium text-success">
                        Preferensi tema berhasil disimpan ke database.
                    </div>
                )}

                <div className="rounded-3xl border border-border bg-surface p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-foreground">
                            Tampilan
                        </h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Pilih mode, tema, dan warna yang nyaman untukmu.
                        </p>
                    </div>

                    <ThemeSettings />
                </div>
            </div>
        </AppLayout>
    );
}

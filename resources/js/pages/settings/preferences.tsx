import { Form, Head, usePage } from '@inertiajs/react';

import { update } from '@/actions/App/Http/Controllers/Settings/UserPreferenceController';
import {
    SelectField,
    StatusMessage,
    SubmitButton,
    TextField,
} from '@/components/form-controls';
import SettingsLayout from '@/layouts/settings-layout';

type PreferencesData = {
    theme_mode: string;
    theme_preset: string;
    primary_hex: string | null;
    secondary_hex: string | null;
    accent_hex: string | null;
    timezone: string;
};

export default function Preferences({
    preferences,
    themeModes,
    themePresets,
}: {
    preferences: PreferencesData;
    themeModes: string[];
    themePresets: string[];
}) {
    const { flash } = usePage().props;

    return (
        <SettingsLayout
            title="Preferensi"
            description="Atur tampilan dan zona waktu akun Anda."
        >
            <Head title="Preferensi" />
            <StatusMessage message={flash.status} />

            <Form {...update.form()} className="grid gap-4">
                {({ errors, processing }) => (
                    <>
                        <SelectField
                            label="Mode tema"
                            name="theme_mode"
                            defaultValue={preferences.theme_mode}
                            required
                            error={errors.theme_mode}
                        >
                            {themeModes.map((mode) => (
                                <option key={mode} value={mode}>
                                    {mode}
                                </option>
                            ))}
                        </SelectField>
                        <SelectField
                            label="Preset tema"
                            name="theme_preset"
                            defaultValue={preferences.theme_preset}
                            required
                            error={errors.theme_preset}
                        >
                            {themePresets.map((preset) => (
                                <option key={preset} value={preset}>
                                    {preset}
                                </option>
                            ))}
                        </SelectField>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <TextField
                                label="Warna utama"
                                name="primary_hex"
                                placeholder="#0284C7"
                                defaultValue={preferences.primary_hex ?? ''}
                                error={errors.primary_hex}
                            />
                            <TextField
                                label="Warna kedua"
                                name="secondary_hex"
                                placeholder="#0F172A"
                                defaultValue={preferences.secondary_hex ?? ''}
                                error={errors.secondary_hex}
                            />
                            <TextField
                                label="Warna aksen"
                                name="accent_hex"
                                placeholder="#10B981"
                                defaultValue={preferences.accent_hex ?? ''}
                                error={errors.accent_hex}
                            />
                        </div>

                        <TextField
                            label="Zona waktu"
                            name="timezone"
                            defaultValue={preferences.timezone}
                            placeholder="Asia/Jakarta"
                            required
                            error={errors.timezone}
                        />

                        <SubmitButton processing={processing}>
                            Simpan preferensi
                        </SubmitButton>
                    </>
                )}
            </Form>
        </SettingsLayout>
    );
}

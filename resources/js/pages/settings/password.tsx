import { Form, Head, usePage } from '@inertiajs/react';

import { update } from '@/actions/App/Http/Controllers/Settings/PasswordController';
import {
    StatusMessage,
    SubmitButton,
    TextField,
} from '@/components/form-controls';
import SettingsLayout from '@/layouts/settings-layout';

export default function Password() {
    const { flash } = usePage().props;

    return (
        <SettingsLayout
            title="Kata sandi"
            description="Gunakan kata sandi yang kuat dan tidak digunakan di layanan lain."
        >
            <Head title="Kata sandi" />
            <StatusMessage message={flash.status} />

            <Form {...update.form()} resetOnSuccess className="grid gap-4">
                {({ errors, processing }) => (
                    <>
                        <TextField
                            label="Kata sandi saat ini"
                            name="current_password"
                            type="password"
                            autoComplete="current-password"
                            required
                            error={errors.current_password}
                        />
                        <TextField
                            label="Kata sandi baru"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            error={errors.password}
                        />
                        <TextField
                            label="Konfirmasi kata sandi baru"
                            name="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            required
                            error={errors.password_confirmation}
                        />
                        <SubmitButton processing={processing}>
                            Perbarui kata sandi
                        </SubmitButton>
                    </>
                )}
            </Form>
        </SettingsLayout>
    );
}

import { Form, Head, usePage } from '@inertiajs/react';

import { update } from '@/actions/App/Http/Controllers/Settings/ProfileController';
import {
    StatusMessage,
    SubmitButton,
    TextField,
} from '@/components/form-controls';
import SettingsLayout from '@/layouts/settings-layout';

type ProfileUser = {
    id: string;
    name: string;
    email: string;
};

export default function Profile({ user }: { user: ProfileUser }) {
    const { flash } = usePage().props;

    return (
        <SettingsLayout
            title="Profil"
            description="Perbarui nama dan alamat email akun Anda."
        >
            <Head title="Profil" />
            <StatusMessage message={flash.status} />

            <Form {...update.form()} className="grid gap-4">
                {({ errors, processing }) => (
                    <>
                        <TextField
                            label="Nama"
                            name="name"
                            defaultValue={user.name}
                            autoComplete="name"
                            required
                            error={errors.name}
                        />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            defaultValue={user.email}
                            autoComplete="email"
                            required
                            error={errors.email}
                        />
                        <SubmitButton processing={processing}>
                            Simpan profil
                        </SubmitButton>
                    </>
                )}
            </Form>
        </SettingsLayout>
    );
}

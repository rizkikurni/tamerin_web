import { Form, Head } from '@inertiajs/react';

import { store } from '@/actions/App/Http/Controllers/Auth/NewPasswordController';
import { SubmitButton, TextField } from '@/components/form-controls';
import AuthLayout from '@/layouts/auth-layout';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    return (
        <AuthLayout
            title="Atur ulang kata sandi"
            description="Masukkan kata sandi baru untuk akun Anda."
        >
            <Head title="Atur ulang kata sandi" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                className="grid gap-4"
            >
                {({ errors, processing }) => (
                    <>
                        <input type="hidden" name="token" value={token} />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={email}
                            readOnly
                            required
                            error={errors.email}
                        />
                        <TextField
                            label="Kata sandi baru"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            autoFocus
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
                            Simpan kata sandi
                        </SubmitButton>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

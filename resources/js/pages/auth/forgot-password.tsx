import { Form, Head, Link, usePage } from '@inertiajs/react';

import { create as login } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { store } from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import {
    StatusMessage,
    SubmitButton,
    TextField,
} from '@/components/form-controls';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword() {
    const { flash } = usePage().props;

    return (
        <AuthLayout
            title="Lupa kata sandi"
            description="Kami akan mengirim tautan pengaturan ulang ke email Anda."
        >
            <Head title="Lupa kata sandi" />
            <StatusMessage message={flash.status} />

            <Form {...store.form()} className="grid gap-4">
                {({ errors, processing }) => (
                    <>
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            required
                            error={errors.email}
                        />
                        <SubmitButton processing={processing}>
                            Kirim tautan
                        </SubmitButton>
                    </>
                )}
            </Form>

            <Link
                href={login()}
                className="text-sm text-sky-700 hover:underline dark:text-sky-400"
            >
                Kembali ke halaman masuk
            </Link>
        </AuthLayout>
    );
}

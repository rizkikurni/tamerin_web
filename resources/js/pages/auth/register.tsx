import { Form, Head, Link } from '@inertiajs/react';

import { create as login } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { store } from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { SubmitButton, TextField } from '@/components/form-controls';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    return (
        <AuthLayout
            title="Buat akun"
            description="Mulai dengan data akun dasar Anda."
        >
            <Head title="Daftar" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                className="grid gap-4"
            >
                {({ errors, processing }) => (
                    <>
                        <TextField
                            label="Nama"
                            name="name"
                            autoComplete="name"
                            autoFocus
                            required
                            error={errors.name}
                        />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            error={errors.email}
                        />
                        <TextField
                            label="Kata sandi"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            error={errors.password}
                        />
                        <TextField
                            label="Konfirmasi kata sandi"
                            name="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            required
                            error={errors.password_confirmation}
                        />

                        <SubmitButton processing={processing}>
                            Daftar
                        </SubmitButton>
                    </>
                )}
            </Form>

            <p className="text-sm text-foreground-secondary">
                Sudah punya akun?{' '}
                <Link href={login()} className="text-primary hover:underline">
                    Masuk
                </Link>
            </p>
        </AuthLayout>
    );
}

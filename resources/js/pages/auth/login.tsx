import { Form, Head, Link, usePage } from '@inertiajs/react';

import { store } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { create as forgotPassword } from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { create as register } from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import {
    StatusMessage,
    SubmitButton,
    TextField,
} from '@/components/form-controls';
import AuthLayout from '@/layouts/auth-layout';

export default function Login() {
    const { flash } = usePage().props;

    return (
        <AuthLayout
            title="Masuk"
            description="Gunakan akun Tamerin Anda untuk melanjutkan."
        >
            <Head title="Masuk" />
            <StatusMessage message={flash.status} />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="grid gap-4"
            >
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
                        <TextField
                            label="Kata sandi"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            error={errors.password}
                        />

                        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <input
                                name="remember"
                                type="checkbox"
                                value="1"
                                className="h-4 w-4 rounded border-slate-300 text-sky-600"
                            />
                            Ingat saya
                        </label>

                        <SubmitButton processing={processing}>
                            Masuk
                        </SubmitButton>
                    </>
                )}
            </Form>

            <div className="flex flex-wrap justify-between gap-3 text-sm">
                <Link
                    href={forgotPassword()}
                    className="text-sky-700 hover:underline dark:text-sky-400"
                >
                    Lupa kata sandi?
                </Link>
                <Link
                    href={register()}
                    className="text-sky-700 hover:underline dark:text-sky-400"
                >
                    Buat akun
                </Link>
            </div>
        </AuthLayout>
    );
}

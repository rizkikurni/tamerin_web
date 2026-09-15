import { Form, Head, Link } from '@inertiajs/react';
import { useCallback, useState } from 'react';

import { create as login } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { store } from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import TurnstileWidget from '@/components/auth/turnstile-widget';
import { SubmitButton, TextField } from '@/components/form-controls';
import AuthLayout from '@/layouts/auth-layout';

const passwordRequirements = [
    'Minimal 12 karakter',
    'Mengandung huruf besar dan huruf kecil',
    'Mengandung minimal satu angka dan satu simbol',
    'Belum pernah terdeteksi dalam kebocoran data',
    'Konfirmasi harus sama dengan kata sandi',
];

export default function Register({
    turnstileSiteKey,
}: {
    turnstileSiteKey?: string | null;
}) {
    const [turnstileInstance, setTurnstileInstance] = useState(0);
    const [isTurnstileVerified, setIsTurnstileVerified] =
        useState(!turnstileSiteKey);
    const handleVerificationChange = useCallback((verified: boolean) => {
        setIsTurnstileVerified(verified);
    }, []);

    const resetTurnstile = useCallback(() => {
        if (!turnstileSiteKey) {
            return;
        }

        setIsTurnstileVerified(false);
        setTurnstileInstance((instance) => instance + 1);
    }, [turnstileSiteKey]);

    return (
        <AuthLayout
            title="Buat akun"
            description="Mulai dengan data akun dasar Anda."
        >
            <Head title="Daftar" />

            <Form
                {...store.form()}
                noValidate
                resetOnSuccess={['password', 'password_confirmation']}
                onError={resetTurnstile}
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
                            aria-describedby="password-requirements"
                            required
                            error={errors.password}
                        />
                        <div
                            id="password-requirements"
                            className="rounded-[14px] border border-[var(--control-border)] bg-[var(--control-background)] px-3.5 py-3 shadow-[var(--control-shadow)]"
                        >
                            <p className="text-xs font-medium text-foreground-secondary">
                                Aturan kata sandi
                            </p>
                            <ul className="mt-2 grid list-disc gap-1 pl-4 text-xs font-light text-muted-foreground">
                                {passwordRequirements.map((requirement) => (
                                    <li key={requirement}>{requirement}</li>
                                ))}
                            </ul>
                        </div>
                        <TextField
                            label="Konfirmasi kata sandi"
                            name="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            required
                            error={errors.password_confirmation}
                        />

                        {turnstileSiteKey && (
                            <TurnstileWidget
                                key={turnstileInstance}
                                siteKey={turnstileSiteKey}
                                action="register"
                                error={errors['cf-turnstile-response']}
                                onVerificationChange={handleVerificationChange}
                            />
                        )}

                        <SubmitButton
                            processing={processing}
                            disabled={processing || !isTurnstileVerified}
                        >
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

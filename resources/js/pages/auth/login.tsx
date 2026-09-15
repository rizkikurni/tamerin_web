import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';

import { store } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { create as forgotPassword } from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { create as register } from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import TurnstileWidget from '@/components/auth/turnstile-widget';
import {
    StatusMessage,
    SubmitButton,
    TextField,
} from '@/components/form-controls';
import AuthLayout from '@/layouts/auth-layout';

export default function Login({
    turnstileSiteKey,
}: {
    turnstileSiteKey?: string | null;
}) {
    const { flash } = usePage().props;
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
            title="Masuk"
            description="Gunakan akun Tamerin Anda untuk melanjutkan."
        >
            <Head title="Masuk" />
            <StatusMessage message={flash.status} />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                onError={resetTurnstile}
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

                        <label className="flex items-center gap-2 text-sm text-foreground-secondary">
                            <input
                                name="remember"
                                type="checkbox"
                                value="1"
                                className="h-4 w-4 rounded border-border accent-primary"
                            />
                            Ingat saya
                        </label>

                        {turnstileSiteKey && (
                            <TurnstileWidget
                                key={turnstileInstance}
                                siteKey={turnstileSiteKey}
                                action="login"
                                error={errors['cf-turnstile-response']}
                                onVerificationChange={handleVerificationChange}
                            />
                        )}

                        <SubmitButton
                            processing={processing}
                            disabled={processing || !isTurnstileVerified}
                        >
                            Masuk
                        </SubmitButton>
                    </>
                )}
            </Form>

            <div className="flex flex-wrap justify-between gap-3 text-sm">
                <Link
                    href={forgotPassword()}
                    className="text-primary hover:underline"
                >
                    Lupa kata sandi?
                </Link>
                <Link
                    href={register()}
                    className="text-primary hover:underline"
                >
                    Buat akun
                </Link>
            </div>
        </AuthLayout>
    );
}

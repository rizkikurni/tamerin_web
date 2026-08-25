import { Form, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { destroy } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { edit as passwordEdit } from '@/actions/App/Http/Controllers/Settings/PasswordController';
import { edit as profileEdit } from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { edit as preferencesEdit } from '@/actions/App/Http/Controllers/Settings/UserPreferenceController';
import { home } from '@/routes';

export default function SettingsLayout({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    const { auth } = usePage().props;

    return (
        <main className="min-h-screen bg-background px-4 py-8 text-foreground">
            <div className="mx-auto grid max-w-4xl gap-6">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-[var(--glass-border)] bg-surface/90 p-5 shadow-[var(--glass-shadow)] backdrop-blur-xl">
                    <div>
                        <Link
                            href={home()}
                            className="text-lg font-medium text-primary"
                        >
                            Tamerin
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            {auth.user?.name} · {auth.user?.email}
                        </p>
                    </div>

                    <Form {...destroy.form()}>
                        {({ processing }) => (
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:border-border-strong hover:bg-surface-muted hover:text-foreground disabled:opacity-60"
                            >
                                Keluar
                            </button>
                        )}
                    </Form>
                </header>

                <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                    <nav className="grid content-start gap-2 rounded-[22px] border border-[var(--glass-border)] bg-surface/90 p-4 shadow-[var(--glass-shadow)] backdrop-blur-xl">
                        <Link
                            href={profileEdit()}
                            className="rounded-xl px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                            Profil
                        </Link>
                        <Link
                            href={passwordEdit()}
                            className="rounded-xl px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                            Kata sandi
                        </Link>
                        <Link
                            href={preferencesEdit()}
                            className="rounded-xl px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                            Preferensi
                        </Link>
                    </nav>

                    <section className="grid content-start gap-6 rounded-[22px] border border-[var(--glass-border)] bg-surface/90 p-6 shadow-[var(--glass-shadow)] backdrop-blur-xl">
                        <div className="grid gap-1">
                            <h1 className="text-2xl font-medium text-foreground">
                                {title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>

                        {children}
                    </section>
                </div>
            </div>
        </main>
    );
}

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
        <main className="min-h-screen bg-slate-100 px-4 py-8 dark:bg-slate-950">
            <div className="mx-auto grid max-w-4xl gap-6">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                    <div>
                        <Link
                            href={home()}
                            className="text-lg font-bold text-sky-700 dark:text-sky-400"
                        >
                            Tamerin
                        </Link>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {auth.user?.name} · {auth.user?.email}
                        </p>
                    </div>

                    <Form {...destroy.form()}>
                        {({ processing }) => (
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Keluar
                            </button>
                        )}
                    </Form>
                </header>

                <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                    <nav className="grid content-start gap-2 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
                        <Link
                            href={profileEdit()}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Profil
                        </Link>
                        <Link
                            href={passwordEdit()}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Kata sandi
                        </Link>
                        <Link
                            href={preferencesEdit()}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Preferensi
                        </Link>
                    </nav>

                    <section className="grid content-start gap-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
                        <div className="grid gap-1">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {title}
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
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

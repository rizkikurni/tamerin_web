import { Head, Link, usePage } from '@inertiajs/react';

import { create as login } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { create as register } from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { edit as profile } from '@/actions/App/Http/Controllers/Settings/ProfileController';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Beranda" />
            <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 dark:bg-slate-950">
                <section className="grid w-full max-w-2xl gap-6 rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900">
                    <div className="grid gap-2">
                        <p className="font-medium text-sky-700 dark:text-sky-400">
                            Tamerin
                        </p>
                        <h1 className="text-3xl font-medium text-slate-900 dark:text-white">
                            Kelola keuangan pribadi dengan lebih teratur.
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Versi awal ini menyediakan autentikasi, profil, kata
                            sandi, dan preferensi akun.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {auth.user ? (
                            <Link
                                href={profile()}
                                className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
                            >
                                Buka pengaturan
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

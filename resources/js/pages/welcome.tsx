import { Head, Link, usePage } from '@inertiajs/react';

import { create as login } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { create as register } from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { edit as profile } from '@/actions/App/Http/Controllers/Settings/ProfileController';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Beranda" />
            <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
                <section className="grid w-full max-w-2xl gap-6 rounded-[22px] border border-[var(--glass-border)] bg-surface/90 p-8 shadow-[var(--glass-shadow)] backdrop-blur-xl">
                    <div className="grid gap-2">
                        <p className="font-medium text-primary">Tamerin</p>
                        <h1 className="text-3xl font-medium text-foreground">
                            Kelola keuangan pribadi dengan lebih teratur.
                        </h1>
                        <p className="text-foreground-secondary">
                            Versi awal ini menyediakan autentikasi, profil, kata
                            sandi, dan preferensi akun.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {auth.user ? (
                            <Link
                                href={profile()}
                                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-105"
                            >
                                Buka pengaturan
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-105"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm font-medium text-foreground-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-foreground"
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

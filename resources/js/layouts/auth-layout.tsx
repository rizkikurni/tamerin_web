import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { home } from '@/routes';

export default function AuthLayout({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 dark:bg-slate-950">
            <section className="grid w-full max-w-md gap-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
                <div className="grid gap-4">
                    <Link
                        href={home()}
                        className="text-lg font-bold text-sky-700 dark:text-sky-400"
                    >
                        Tamerin
                    </Link>
                    <div className="grid gap-1">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {title}
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {description}
                        </p>
                    </div>
                </div>

                {children}
            </section>
        </main>
    );
}

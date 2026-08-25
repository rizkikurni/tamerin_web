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
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
            <section className="grid w-full max-w-md gap-6 rounded-[22px] border border-[var(--glass-border)] bg-surface/90 p-6 shadow-[var(--glass-shadow)] backdrop-blur-xl">
                <div className="grid gap-4">
                    <Link
                        href={home()}
                        className="text-lg font-medium text-primary"
                    >
                        Tamerin
                    </Link>
                    <div className="grid gap-1">
                        <h1 className="text-2xl font-medium text-foreground">
                            {title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                {children}
            </section>
        </main>
    );
}

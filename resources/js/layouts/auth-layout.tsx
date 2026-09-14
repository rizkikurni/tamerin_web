import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import BrandIcon from '@/components/brand-icon';
import SeoHead from '@/components/seo-head';
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
        <>
            <SeoHead title={title} description={description} />
            <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
                <section className="grid w-full max-w-md gap-6 rounded-[22px] border border-[var(--glass-border)] bg-surface/90 p-6 shadow-[var(--glass-shadow)] backdrop-blur-xl">
                    <div className="grid gap-4">
                        <Link
                            href={home()}
                            className="inline-flex w-fit items-center gap-2.5 text-lg font-medium text-foreground"
                        >
                            <span className="grid size-9 place-items-center rounded-xl border border-primary/25 bg-primary-soft text-primary shadow-[var(--brand-shadow)]">
                                <BrandIcon className="size-[22px]" />
                            </span>
                            <span>Tamerin</span>
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
        </>
    );
}

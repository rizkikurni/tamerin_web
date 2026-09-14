import { Link } from '@inertiajs/react';

import type { dashboard, register } from '@/routes';

interface LandingPrimaryLinkProps {
    href: ReturnType<typeof dashboard> | ReturnType<typeof register>;
    label: string;
    compact?: boolean;
}

export default function LandingPrimaryLink({
    href,
    label,
    compact = false,
}: LandingPrimaryLinkProps) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center rounded-xl border border-primary/40 bg-primary font-medium text-primary-foreground shadow-[var(--brand-shadow)] transition hover:-translate-y-px hover:shadow-[var(--brand-shadow-hover)] hover:brightness-105 ${compact ? 'h-10 px-4 text-sm' : 'h-12 px-5 text-sm'}`}
        >
            {label}
        </Link>
    );
}

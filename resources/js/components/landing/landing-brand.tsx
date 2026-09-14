import { Link } from '@inertiajs/react';

import BrandIcon from '@/components/brand-icon';
import { home } from '@/routes';

export default function LandingBrand() {
    return (
        <Link
            href={home()}
            className="inline-flex items-center gap-2.5 text-foreground"
            aria-label="Tamerin - Beranda"
        >
            <span className="grid size-10 place-items-center rounded-xl border border-primary/25 bg-primary-soft text-primary shadow-[var(--brand-shadow)]">
                <BrandIcon className="size-6" />
            </span>
            <span className="text-lg font-medium">Tamerin</span>
        </Link>
    );
}

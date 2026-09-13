import { Link } from '@inertiajs/react';
import { PiggyBank } from 'lucide-react';

import { home } from '@/routes';

export default function LandingBrand() {
    return (
        <Link
            href={home()}
            className="inline-flex items-center gap-2.5 text-foreground"
            aria-label="Tamerin - Beranda"
        >
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--brand-shadow)]">
                <PiggyBank className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-medium">Tamerin</span>
        </Link>
    );
}

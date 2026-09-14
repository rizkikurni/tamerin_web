import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';

import LandingBrand from './landing-brand';
import LandingPrimaryLink from './landing-primary-link';

interface LandingHeaderProps {
    authenticated: boolean;
}

export default function LandingHeader({ authenticated }: LandingHeaderProps) {
    const [scrolled, setScrolled] = useState(false);
    const primaryDestination = authenticated ? dashboard() : register();
    const primaryLabel = authenticated ? 'Buka dashboard' : 'Mulai sekarang';

    useEffect(() => {
        const updateScrolledState = () => setScrolled(window.scrollY > 16);

        updateScrolledState();
        window.addEventListener('scroll', updateScrolledState, {
            passive: true,
        });

        return () => window.removeEventListener('scroll', updateScrolledState);
    }, []);

    return (
        <header className="sticky top-0 z-50 px-3 pt-3">
            <div
                className={cn(
                    'mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border px-4 transition-all duration-300 lg:px-6',
                    scrolled
                        ? 'border-[var(--glass-border-strong)] bg-surface/75 shadow-[var(--glass-shadow)] backdrop-blur-2xl'
                        : 'border-transparent bg-background/90 backdrop-blur-sm',
                )}
            >
                <LandingBrand />

                <nav
                    className="hidden items-center gap-8 text-sm text-foreground-secondary md:flex"
                    aria-label="Navigasi utama"
                >
                    <a
                        href="#fitur"
                        className="transition-colors hover:text-primary"
                    >
                        Fitur
                    </a>
                    <a
                        href="#cara-kerja"
                        className="transition-colors hover:text-primary"
                    >
                        Cara kerja
                    </a>
                    <a
                        href="#keamanan"
                        className="transition-colors hover:text-primary"
                    >
                        Keamanan
                    </a>
                </nav>

                <div className="flex items-center gap-2">
                    {!authenticated && (
                        <Link
                            href={login()}
                            className="hidden h-10 items-center rounded-xl px-4 text-sm font-medium text-foreground-secondary transition-colors hover:bg-primary-soft hover:text-primary sm:inline-flex"
                        >
                            Masuk
                        </Link>
                    )}
                    <LandingPrimaryLink
                        href={primaryDestination}
                        label={primaryLabel}
                        compact
                    />
                </div>
            </div>
        </header>
    );
}

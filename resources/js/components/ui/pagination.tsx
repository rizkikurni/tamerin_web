import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/types';

function linkLabel(label: string): string {
    if (label.includes('Previous')) {
        return 'Sebelumnya';
    }

    if (label.includes('Next')) {
        return 'Berikutnya';
    }

    return label;
}

export default function Pagination({ links }: { links: PaginationLink[] }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav aria-label="Navigasi halaman" className="flex flex-wrap gap-1.5">
            {links.map((link, index) => {
                const label = linkLabel(link.label);
                const isPageNumber = /^\d+$/.test(label);
                const sizeClass = isPageNumber ? 'w-9 px-0' : 'px-3';

                if (!link.url) {
                    return (
                        <span
                            key={`${link.label}-${index}`}
                            className={cn(
                                'inline-flex h-9 items-center justify-center rounded-full',
                                'border-[1.5px] border-border-strong/70 bg-background/60',
                                'text-xs text-muted-foreground opacity-50 shadow-[var(--control-shadow)]',
                                sizeClass,
                            )}
                        >
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={`${link.label}-${index}`}
                        href={link.url}
                        preserveScroll
                        className={cn(
                            'inline-flex h-9 items-center justify-center rounded-full border-[1.5px]',
                            'text-xs font-medium transition-all duration-200 ease-out',
                            'hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none',
                            sizeClass,
                            link.active
                                ? 'border-primary/40 bg-primary text-primary-foreground shadow-[var(--brand-shadow)]'
                                : [
                                      'border-border-strong/70 bg-background/80 text-foreground',
                                      'shadow-[var(--control-shadow)]',
                                      'hover:border-[var(--glass-border-strong)] hover:border-x-primary/30',
                                      'hover:bg-surface-muted/95 hover:[background-image:var(--control-gradient)]',
                                      'hover:text-primary hover:shadow-[var(--control-shadow-hover)]',
                                  ],
                        )}
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}

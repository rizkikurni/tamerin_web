import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'bottom' | 'left' | 'right' | 'top';
}

const directionClasses = {
    bottom: 'landing-reveal-from-bottom',
    left: 'landing-reveal-from-left',
    right: 'landing-reveal-from-right',
    top: 'landing-reveal-from-top',
};

export function useElementVisibility<T extends HTMLElement>() {
    const elementRef = useRef<T>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = elementRef.current;

        if (!element || !('IntersectionObserver' in window)) {
            setVisible(true);

            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '0px 0px -20px 0px', threshold: 0.05 },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return { elementRef, visible };
}

export default function Reveal({
    children,
    className,
    delay = 0,
    direction = 'bottom',
}: RevealProps) {
    const { elementRef, visible } = useElementVisibility<HTMLDivElement>();

    return (
        <div
            ref={elementRef}
            className={cn(
                'landing-reveal',
                directionClasses[direction],
                visible && 'is-visible',
                className,
            )}
            style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
        >
            {children}
        </div>
    );
}

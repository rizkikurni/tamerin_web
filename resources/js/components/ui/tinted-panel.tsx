import type {
    HTMLAttributes,
    ReactNode,
} from 'react';

interface TintedPanelProps
    extends HTMLAttributes<HTMLElement> {
    children: ReactNode;
}

export default function TintedPanel({
    children,
    className = '',
    ...props
}: TintedPanelProps) {
    return (
        <section
            className={[
                'rounded-[32px]',
                'bg-surface-tinted',
                'p-4 md:p-5 lg:p-6',
                className,
            ].join(' ')}
            {...props}
        >
            {children}
        </section>
    );
}

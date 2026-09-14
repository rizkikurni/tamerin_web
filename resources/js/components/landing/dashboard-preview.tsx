import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

import { useElementVisibility } from './reveal';

const chartBars = [44, 62, 52, 78, 58, 86, 72];

interface AnimatedNumberProps {
    active: boolean;
    target: number;
    prefix?: string;
    suffix: string;
    fractionDigits?: number;
}

function AnimatedNumber({
    active,
    target,
    prefix = '',
    suffix,
    fractionDigits = 0,
}: AnimatedNumberProps) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!active) {
            return;
        }

        let animationFrame = 0;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            animationFrame = requestAnimationFrame(() => setValue(target));

            return () => cancelAnimationFrame(animationFrame);
        }

        const startedAt = performance.now();
        const duration = 1500;

        const updateValue = (timestamp: number) => {
            const progress = Math.min((timestamp - startedAt) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            setValue(target * easedProgress);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(updateValue);
            }
        };

        animationFrame = requestAnimationFrame(updateValue);

        return () => cancelAnimationFrame(animationFrame);
    }, [active, target]);

    return (
        <>
            {prefix}
            {value.toLocaleString('id-ID', {
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
            })}
            {suffix}
        </>
    );
}

export default function DashboardPreview() {
    const { elementRef, visible } = useElementVisibility<HTMLDivElement>();

    return (
        <div
            ref={elementRef}
            className={cn(
                'landing-preview relative mx-auto w-full max-w-2xl',
                visible && 'is-visible',
            )}
            aria-label="Pratinjau dashboard Tamerin"
        >
            <div className="rounded-[28px] border border-primary/15 bg-surface/90 p-3 shadow-[var(--popup-shadow)] backdrop-blur-xl sm:p-5">
                <div className="mb-5">
                    <p className="text-xs text-muted-foreground">
                        Ringkasan bulan ini
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                        Dashboard keuangan
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <PreviewMetric
                        active={visible}
                        index={0}
                        label="Total saldo"
                        target={24.8}
                        accent="bg-primary"
                    />
                    <PreviewMetric
                        active={visible}
                        index={1}
                        label="Pemasukan"
                        target={8.4}
                        accent="bg-success"
                    />
                    <PreviewMetric
                        active={visible}
                        index={2}
                        label="Pengeluaran"
                        target={5.1}
                        accent="bg-danger"
                    />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-[1.45fr_1fr]">
                    <div className="rounded-2xl border border-primary/10 bg-primary-soft/55 p-4">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Arus kas
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                                7 bulan terakhir
                            </p>
                        </div>
                        <div className="mt-6 flex h-24 items-end gap-2">
                            {chartBars.map((height, index) => (
                                <div
                                    key={`${height}-${index}`}
                                    className="landing-chart-bar flex-1 overflow-hidden rounded-t-md bg-primary/20"
                                    style={
                                        {
                                            height: `${height}%`,
                                            '--bar-index': index,
                                        } as CSSProperties
                                    }
                                >
                                    <div className="h-2/5 rounded-t-md bg-primary" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-secondary/15 bg-secondary-soft/55 p-4">
                        <p className="text-xs text-muted-foreground">
                            Anggaran terpakai
                        </p>
                        <div className="landing-pie mx-auto my-4 grid size-24 place-items-center rounded-full bg-[conic-gradient(var(--primary)_0_68%,var(--surface-tinted)_68%_100%)]">
                            <div
                                className="grid size-16 place-items-center rounded-full bg-surface text-sm font-medium text-foreground"
                                aria-label="68 persen"
                            >
                                <AnimatedNumber
                                    active={visible}
                                    target={68}
                                    suffix="%"
                                />
                            </div>
                        </div>
                        <p className="text-center text-xs text-foreground-secondary">
                            Masih dalam batas aman
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface PreviewMetricProps {
    active: boolean;
    index: number;
    label: string;
    target: number;
    accent: string;
}

function PreviewMetric({
    active,
    index,
    label,
    target,
    accent,
}: PreviewMetricProps) {
    return (
        <div
            className="landing-preview-metric relative overflow-hidden rounded-2xl border border-primary/10 bg-surface-tinted/45 p-4"
            style={{ '--metric-index': index } as CSSProperties}
        >
            <span className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p
                className="mt-2 text-lg font-medium text-foreground"
                aria-label={`Rp${target.toLocaleString('id-ID')} juta`}
            >
                <span aria-hidden="true">
                    <AnimatedNumber
                        active={active}
                        target={target}
                        prefix="Rp"
                        suffix=" jt"
                        fractionDigits={1}
                    />
                </span>
            </p>
        </div>
    );
}

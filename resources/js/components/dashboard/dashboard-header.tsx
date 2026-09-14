import { router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarDays, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { DashboardPeriod } from '@/types';

interface DashboardPeriodPickerProps {
    period: DashboardPeriod;
    className?: string;
    popupAlign?: 'left' | 'right';
    showChevron?: boolean;
}

const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

export function DashboardPeriodPicker({
    period,
    className,
    popupAlign = 'left',
    showChevron = true,
}: DashboardPeriodPickerProps) {
    const [periodYear, periodMonth] = period.value.split('-').map(Number);
    const [selectedMonth, setSelectedMonth] = useState(periodMonth - 1);
    const [selectedYear, setSelectedYear] = useState(periodYear);
    const [pickerOpen, setPickerOpen] = useState(false);
    const pickerId = useId();
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pickerOpen) {
            return;
        }

        function closeWhenClickingOutside(event: PointerEvent) {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node)
            ) {
                setPickerOpen(false);
            }
        }

        function closeWithEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setPickerOpen(false);
            }
        }

        document.addEventListener('pointerdown', closeWhenClickingOutside);
        document.addEventListener('keydown', closeWithEscape);

        return () => {
            document.removeEventListener(
                'pointerdown',
                closeWhenClickingOutside,
            );
            document.removeEventListener('keydown', closeWithEscape);
        };
    }, [pickerOpen]);

    const selectPeriod = (month: number, year: number) => {
        const value = `${year}-${String(month + 1).padStart(2, '0')}`;

        setSelectedMonth(month);
        setSelectedYear(year);
        setPickerOpen(false);
        router.get(
            dashboard.url({ query: { period: value } }),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <div
            ref={pickerRef}
            className={cn('dashboard-period-picker relative', className)}
        >
            <button
                type="button"
                onClick={() => setPickerOpen(!pickerOpen)}
                aria-expanded={pickerOpen}
                aria-controls={pickerId}
                aria-haspopup="dialog"
                className={cn(
                    'inline-flex items-center gap-2',
                    'rounded-xl border border-border bg-surface',
                    'px-3.5 py-2 text-sm font-medium text-foreground',
                    'transition-colors hover:bg-surface-muted',
                )}
            >
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {period.label}
                {showChevron && (
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            pickerOpen && 'rotate-180',
                        )}
                    />
                )}
            </button>

            {pickerOpen && (
                <div
                    id={pickerId}
                    role="dialog"
                    aria-label="Pilih periode dashboard"
                    className={cn(
                        'absolute top-full z-[60] mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-2xl',
                        'border border-[var(--glass-border-strong)] bg-surface/95 p-4',
                        'shadow-[var(--popup-shadow)] backdrop-blur-xl',
                        popupAlign === 'right'
                            ? 'right-0 max-lg:right-auto max-lg:left-0'
                            : 'left-0',
                    )}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            aria-label="Tahun sebelumnya"
                            onClick={() => setSelectedYear(selectedYear - 1)}
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium text-foreground">
                            {selectedYear}
                        </span>
                        <button
                            type="button"
                            aria-label="Tahun berikutnya"
                            onClick={() => setSelectedYear(selectedYear + 1)}
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                        {months.map((month, index) => (
                            <button
                                key={month}
                                type="button"
                                onClick={() =>
                                    selectPeriod(index, selectedYear)
                                }
                                className={cn(
                                    'rounded-xl px-2 py-2 text-xs font-medium transition-colors',
                                    index === selectedMonth &&
                                        selectedYear === periodYear
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-foreground-secondary hover:bg-surface-muted',
                                )}
                            >
                                {month.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

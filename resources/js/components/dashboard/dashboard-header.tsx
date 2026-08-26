import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    ChevronDown,
    FileText,
    Plus,
} from 'lucide-react';
import { useState } from 'react';

import Button, { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as createTransaction } from '@/routes/transactions';
import type { DashboardPeriod } from '@/types';

interface DashboardHeaderProps {
    userName: string;
    period: DashboardPeriod;
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

export default function DashboardHeader({
    userName,
    period,
}: DashboardHeaderProps) {
    const [periodYear, periodMonth] = period.value.split('-').map(Number);
    const [selectedMonth, setSelectedMonth] = useState(periodMonth - 1);
    const [selectedYear, setSelectedYear] = useState(periodYear);
    const [pickerOpen, setPickerOpen] = useState(false);

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
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-medium text-foreground">
                    Selamat datang, {userName}
                </h2>
                <p className="mt-1 text-sm font-light text-muted-foreground">
                    Ringkasan kondisi keuanganmu
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setPickerOpen(!pickerOpen)}
                        className={cn(
                            'inline-flex items-center gap-2',
                            'rounded-xl border border-border bg-surface',
                            'px-3.5 py-2 text-sm font-medium text-foreground',
                            'transition-colors hover:bg-surface-muted',
                        )}
                    >
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {period.label}
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 text-muted-foreground transition-transform',
                                pickerOpen && 'rotate-180',
                            )}
                        />
                    </button>

                    {pickerOpen && (
                        <>
                            <button
                                type="button"
                                className="fixed inset-0 z-40 cursor-default"
                                aria-label="Tutup pemilih periode"
                                onClick={() => setPickerOpen(false)}
                            />
                            <div className="absolute top-full left-0 z-50 mt-2 w-72 rounded-2xl border border-[var(--glass-border-strong)] bg-surface/95 p-4 shadow-[var(--popup-shadow)] backdrop-blur-xl">
                                <div className="mb-3 flex items-center justify-between">
                                    <button
                                        type="button"
                                        aria-label="Tahun sebelumnya"
                                        onClick={() =>
                                            setSelectedYear(selectedYear - 1)
                                        }
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
                                        onClick={() =>
                                            setSelectedYear(selectedYear + 1)
                                        }
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
                                                selectPeriod(
                                                    index,
                                                    selectedYear,
                                                )
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
                        </>
                    )}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    disabled
                    title="Laporan tersedia pada fase pengembangan berikutnya"
                >
                    <FileText className="h-4 w-4" />
                    Lihat laporan
                </Button>

                <ButtonLink href={createTransaction.url()} size="sm">
                    <Plus className="h-4 w-4" />
                    Tambah transaksi
                </ButtonLink>
            </div>
        </div>
    );
}

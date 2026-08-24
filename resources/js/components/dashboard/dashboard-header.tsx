import { useState } from 'react';

import { CalendarDays, ChevronDown, FileText, Plus } from 'lucide-react';

import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
    userName: string;
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

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [pickerOpen, setPickerOpen] = useState(false);

    const periodLabel = `${months[selectedMonth]} ${selectedYear}`;

    return (
        <div className="space-y-4">
            {/* Greeting */}
            {/* <div className="space-y-2 text-2xl">
                <p className="font-thin">Poppins Thin 100</p>
                <p className="font-extralight">Poppins ExtraLight 200</p>
                <p className="font-light">Poppins Light 300</p>
                <p className="font-normal">Poppins Regular 400</p>
                <p className="font-medium">Poppins Medium 500</p>
                <p className="font-semibold">Poppins SemiBold 600</p>
            </div> */}
            <div>
                <h2 className="font-regular text-2xl text-foreground">
                    Selamat datang, {userName} 👋
                </h2>
                <p className="mt-1 text-sm font-light text-muted-foreground">
                    Ringkasan kondisi keuanganmu
                </p>
            </div>

            {/* Actions Row */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Period Selector */}
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
                        {periodLabel}
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 text-muted-foreground transition-transform',
                                pickerOpen && 'rotate-180',
                            )}
                        />
                    </button>

                    {pickerOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setPickerOpen(false)}
                                aria-hidden="true"
                            />

                            <div className="absolute top-full left-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-surface p-4 shadow-lg">
                                {/* Year navigation */}
                                <div className="mb-3 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedYear(selectedYear - 1)
                                        }
                                        className="rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                                    >
                                        ←
                                    </button>
                                    <span className="text-sm font-semibold text-foreground">
                                        {selectedYear}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedYear(selectedYear + 1)
                                        }
                                        className="rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                                    >
                                        →
                                    </button>
                                </div>

                                {/* Month grid */}
                                <div className="grid grid-cols-3 gap-1.5">
                                    {months.map((month, index) => (
                                        <button
                                            key={month}
                                            type="button"
                                            onClick={() => {
                                                setSelectedMonth(index);
                                                setPickerOpen(false);
                                            }}
                                            className={cn(
                                                'rounded-xl px-2 py-2 text-xs font-medium transition-colors',
                                                index === selectedMonth
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

                {/* Action Buttons */}
                <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4" />
                    Lihat laporan
                </Button>

                <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Tambah transaksi
                </Button>
            </div>
        </div>
    );
}

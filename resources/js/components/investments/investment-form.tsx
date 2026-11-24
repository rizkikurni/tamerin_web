import { Form } from '@inertiajs/react';
import { RotateCcw, Save, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { TextField } from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { index, show, store, update } from '@/routes/investments';
import type { InvestmentFormData, SelectOption } from '@/types';

type InvestmentFormProps = {
    investment?: InvestmentFormData;
    instrumentOptions: SelectOption[];
    defaultAcquiredOn?: string;
};

const SUGGESTIONS = [
    'Saham BBCA',
    'Saham BBRI',
    'Reksadana Pasar Uang',
    'Reksadana Pendapatan Tetap',
    'SBN / Sukuk Ritel',
    'Emas Antam',
    'Bitcoin (BTC)',
];

const AMOUNT_PRESETS = [
    { label: '+1 Jt', value: 1_000_000 },
    { label: '+5 Jt', value: 5_000_000 },
    { label: '+10 Jt', value: 10_000_000 },
    { label: '+25 Jt', value: 25_000_000 },
    { label: '+50 Jt', value: 50_000_000 },
];

function getPastDate(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() - months);

    return d.toISOString().split('T')[0];
}

function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);

    return d.toISOString().split('T')[0];
}

export default function InvestmentForm({
    investment,
    instrumentOptions,
    defaultAcquiredOn,
}: InvestmentFormProps) {
    const isEditing = investment !== undefined;
    const form = isEditing ? update.form.patch(investment.id) : store.form();
    const cancelHref = isEditing ? show.url(investment.id) : index.url();

    const [name, setName] = useState(investment?.name ?? '');
    const [instrumentType, setInstrumentType] = useState(
        investment?.instrument_type ?? instrumentOptions[0]?.value ?? '',
    );
    const [acquisitionCost, setAcquisitionCost] = useState<number | ''>(
        investment?.acquisition_cost ?? '',
    );
    const [acquiredOn, setAcquiredOn] = useState(
        investment?.acquired_on ?? defaultAcquiredOn ?? getTodayString(),
    );

    const addCost = (added: number) => {
        const current =
            typeof acquisitionCost === 'number' ? acquisitionCost : 0;
        setAcquisitionCost(current + added);
    };

    return (
        <Card variant="navbar">
            <CardContent className="grid gap-5 p-5 sm:p-6">
                <div className="flex items-start gap-3 border-b border-border/70 pb-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-foreground">
                            {isEditing
                                ? 'Informasi investasi'
                                : 'Investasi baru'}
                        </h2>
                        <p className="mt-1 text-sm leading-6 font-light text-muted-foreground">
                            Catat aset investasi, modal perolehan, dan tanggal
                            mulai investasi Anda.
                        </p>
                    </div>
                </div>

                <Form {...form} className="grid gap-5">
                    {({ errors, processing }) => (
                        <>
                            {/* Jenis Instrumen - 1-Tap Pills */}
                            <div className="grid gap-2">
                                <label
                                    htmlFor="instrument_type"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Jenis instrumen{' '}
                                    <span className="text-danger">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {instrumentOptions.map((opt) => {
                                        const isSelected =
                                            instrumentType === opt.value;

                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    setInstrumentType(opt.value)
                                                }
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all active:scale-95',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                                        : 'border-border/80 bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground',
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <input
                                    id="instrument_type"
                                    type="hidden"
                                    name="instrument_type"
                                    value={instrumentType}
                                />
                                {errors.instrument_type && (
                                    <p className="text-xs text-danger">
                                        {errors.instrument_type}
                                    </p>
                                )}
                            </div>

                            {/* Nama Investasi */}
                            <div className="grid gap-2">
                                <TextField
                                    label="Nama investasi"
                                    name="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Saham BBCA atau Reksadana Sucorinvest"
                                    maxLength={120}
                                    required
                                    autoFocus
                                    error={errors.name}
                                />
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                        Inspirasi:
                                    </span>
                                    {SUGGESTIONS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setName(preset)}
                                            className={cn(
                                                'rounded-lg border px-2 py-0.5 text-xs font-normal transition-all',
                                                name === preset
                                                    ? 'border-primary bg-primary-soft text-primary'
                                                    : 'border-border/80 bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground',
                                            )}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tanggal Perolehan */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="acquired_on"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Tanggal perolehan{' '}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAcquiredOn(getTodayString())
                                            }
                                            className={cn(
                                                'rounded px-1.5 py-0.5 text-[11px] transition-colors',
                                                acquiredOn === getTodayString()
                                                    ? 'bg-primary-soft font-semibold text-primary'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            Hari ini
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAcquiredOn(
                                                    getYesterdayString(),
                                                )
                                            }
                                            className={cn(
                                                'rounded px-1.5 py-0.5 text-[11px] transition-colors',
                                                acquiredOn ===
                                                    getYesterdayString()
                                                    ? 'bg-primary-soft font-semibold text-primary'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            Kemarin
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAcquiredOn(getPastDate(1))
                                            }
                                            className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                                        >
                                            1 bln lalu
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAcquiredOn(getPastDate(12))
                                            }
                                            className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                                        >
                                            1 thn lalu
                                        </button>
                                    </div>
                                </div>
                                <input
                                    id="acquired_on"
                                    name="acquired_on"
                                    type="date"
                                    value={acquiredOn}
                                    onChange={(e) =>
                                        setAcquiredOn(e.target.value)
                                    }
                                    required
                                    className={cn(
                                        'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] focus:ring-1 focus:outline-none',
                                        errors.acquired_on &&
                                            'border-danger focus:border-danger focus:ring-danger',
                                    )}
                                />
                                {errors.acquired_on && (
                                    <p className="text-xs text-danger">
                                        {errors.acquired_on}
                                    </p>
                                )}
                            </div>

                            {/* Modal Perolehan */}
                            <div className="grid gap-2">
                                <div className="flex items-baseline justify-between">
                                    <label
                                        htmlFor="acquisition_cost"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Modal perolehan{' '}
                                        <span className="text-danger">*</span>
                                    </label>
                                    {typeof acquisitionCost === 'number' &&
                                        acquisitionCost > 0 && (
                                            <span className="text-xs font-semibold text-primary">
                                                {formatRupiah(acquisitionCost)}
                                            </span>
                                        )}
                                </div>
                                <div className="relative">
                                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                                        Rp
                                    </span>
                                    <input
                                        id="acquisition_cost"
                                        name="acquisition_cost"
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={acquisitionCost}
                                        onChange={(e) =>
                                            setAcquisitionCost(
                                                e.target.value === ''
                                                    ? ''
                                                    : Number(e.target.value),
                                            )
                                        }
                                        placeholder="0"
                                        required
                                        className={cn(
                                            'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface py-2.5 pr-4 pl-10 text-sm font-medium text-foreground shadow-[var(--control-shadow)] placeholder:text-muted-foreground focus:ring-1 focus:outline-none',
                                            errors.acquisition_cost &&
                                                'border-danger focus:border-danger focus:ring-danger',
                                        )}
                                    />
                                </div>
                                {errors.acquisition_cost && (
                                    <p className="text-xs text-danger">
                                        {errors.acquisition_cost}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[11px] font-medium text-muted-foreground">
                                        Tambah cepat:
                                    </span>
                                    {AMOUNT_PRESETS.map((chip) => (
                                        <button
                                            key={chip.label}
                                            type="button"
                                            onClick={() => addCost(chip.value)}
                                            className="rounded-lg border border-border/80 bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary-soft hover:text-primary active:scale-95"
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                    {typeof acquisitionCost === 'number' &&
                                        acquisitionCost > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAcquisitionCost('')
                                                }
                                                className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-surface px-2 py-1 text-xs font-light text-muted-foreground hover:bg-danger/10 hover:text-danger"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                Reset
                                            </button>
                                        )}
                                </div>
                            </div>

                            {/* Jumlah Unit (opsional) */}
                            <div className="grid gap-2">
                                <TextField
                                    label="Jumlah unit (opsional)"
                                    name="units"
                                    type="number"
                                    min="0.00000001"
                                    step="0.00000001"
                                    defaultValue={investment?.units ?? ''}
                                    placeholder="Contoh: 100 lembar / 10.5 unit"
                                    error={errors.units}
                                />
                                <p className="text-[11px] font-light text-muted-foreground">
                                    Dapat diisi jumlah lembar saham, gram emas,
                                    atau koin crypto hingga 8 desimal.
                                </p>
                            </div>

                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
                                <ButtonLink
                                    href={cancelHref}
                                    variant="ghost"
                                    size="sm"
                                >
                                    Batal
                                </ButtonLink>
                                <Button
                                    type="submit"
                                    size="sm"
                                    loading={processing}
                                >
                                    <Save className="h-4 w-4" />
                                    {isEditing
                                        ? 'Simpan perubahan'
                                        : 'Buat investasi'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}

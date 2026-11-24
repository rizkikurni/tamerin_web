import { Form } from '@inertiajs/react';
import { Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { TextAreaField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { store } from '@/routes/investments/valuations';

const VALUATION_PRESETS = [
    { label: '+500rb', value: 500_000 },
    { label: '+1jt', value: 1_000_000 },
    { label: '+2.5jt', value: 2_500_000 },
    { label: '+5jt', value: 5_000_000 },
    { label: '+10jt', value: 10_000_000 },
];

function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);

    return d.toISOString().split('T')[0];
}

export default function InvestmentValuationForm({
    investmentId,
    defaultDate,
}: {
    investmentId: string;
    defaultDate: string;
}) {
    const [value, setValue] = useState<number | ''>('');
    const [date, setDate] = useState(defaultDate || getTodayString());

    const addValuation = (added: number) => {
        const current = typeof value === 'number' ? value : 0;
        setValue(current + added);
    };

    return (
        <Form
            {...store.form(investmentId)}
            options={{ preserveScroll: true }}
            resetOnSuccess
            className="grid gap-4"
        >
            {({ errors, processing }) => (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        {/* Tanggal Valuasi */}
                        <div className="grid gap-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="valued_on"
                                    className="text-xs font-medium text-foreground"
                                >
                                    Tanggal valuasi{' '}
                                    <span className="text-danger">*</span>
                                </label>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDate(getTodayString())
                                        }
                                        className={cn(
                                            'rounded px-1.5 py-0.5 text-[11px] transition-colors',
                                            date === getTodayString()
                                                ? 'bg-primary-soft font-semibold text-primary'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        Hari ini
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDate(getYesterdayString())
                                        }
                                        className={cn(
                                            'rounded px-1.5 py-0.5 text-[11px] transition-colors',
                                            date === getYesterdayString()
                                                ? 'bg-primary-soft font-semibold text-primary'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        Kemarin
                                    </button>
                                </div>
                            </div>
                            <input
                                id="valued_on"
                                name="valued_on"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className={cn(
                                    'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] focus:ring-1 focus:outline-none',
                                    errors.valued_on &&
                                        'border-danger focus:border-danger focus:ring-danger',
                                )}
                            />
                            {errors.valued_on && (
                                <p className="text-xs text-danger">
                                    {errors.valued_on}
                                </p>
                            )}
                        </div>

                        {/* Nilai Terbaru */}
                        <div className="grid gap-1.5">
                            <div className="flex items-baseline justify-between">
                                <label
                                    htmlFor="valuation_value"
                                    className="text-xs font-medium text-foreground"
                                >
                                    Nilai pasar saat ini{' '}
                                    <span className="text-danger">*</span>
                                </label>
                                {typeof value === 'number' && value > 0 && (
                                    <span className="text-[11px] font-semibold text-primary">
                                        {formatRupiah(value)}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                                    Rp
                                </span>
                                <input
                                    id="valuation_value"
                                    name="value"
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={value}
                                    onChange={(e) =>
                                        setValue(
                                            e.target.value === ''
                                                ? ''
                                                : Number(e.target.value),
                                        )
                                    }
                                    placeholder="0"
                                    required
                                    className={cn(
                                        'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface py-2 pr-3 pl-9 text-sm font-medium text-foreground shadow-[var(--control-shadow)] placeholder:text-muted-foreground focus:ring-1 focus:outline-none',
                                        errors.value &&
                                            'border-danger focus:border-danger focus:ring-danger',
                                    )}
                                />
                            </div>
                            {errors.value && (
                                <p className="text-xs text-danger">
                                    {errors.value}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] font-medium text-muted-foreground">
                            Pintasan nominal:
                        </span>
                        {VALUATION_PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => addValuation(preset.value)}
                                className="rounded-lg border border-border/80 bg-surface px-2 py-0.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary-soft hover:text-primary active:scale-95"
                            >
                                {preset.label}
                            </button>
                        ))}
                        {typeof value === 'number' && value > 0 && (
                            <button
                                type="button"
                                onClick={() => setValue('')}
                                className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-surface px-2 py-0.5 text-xs font-light text-muted-foreground hover:bg-danger/10 hover:text-danger"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Reset
                            </button>
                        )}
                    </div>

                    <TextAreaField
                        label="Catatan sumber (opsional)"
                        name="note"
                        maxLength={500}
                        placeholder="Contoh: Harga penutupan aplikasi broker"
                        error={errors.note}
                    />

                    <p className="text-xs leading-5 font-light text-muted-foreground">
                        Satu tanggal hanya dapat dipakai sekali untuk satu
                        holding.
                    </p>

                    <Button
                        type="submit"
                        size="sm"
                        loading={processing}
                        className="rounded-full"
                    >
                        <Plus className="h-4 w-4" />
                        Catat valuasi sekarang
                    </Button>
                </>
            )}
        </Form>
    );
}

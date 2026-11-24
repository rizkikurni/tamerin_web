import { Form } from '@inertiajs/react';
import { CalendarDays, RotateCcw, Save, Sparkles, Target } from 'lucide-react';
import { useState } from 'react';

import { TextField } from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { index, show, store, update } from '@/routes/savings-goals';
import type { SavingsGoalFormData } from '@/types';

const POPULAR_GOALS = [
    'Dana Darurat',
    'Beli Rumah / DP KPR',
    'Liburan / Mudik',
    'Kendaraan Baru',
    'Pendidikan Anak',
    'Gadget / Laptop',
    'Modal Bisnis',
    'Pernikahan',
];

const AMOUNT_PRESETS = [
    { label: '+1 Jt', value: 1_000_000 },
    { label: '+5 Jt', value: 5_000_000 },
    { label: '+10 Jt', value: 10_000_000 },
    { label: '+25 Jt', value: 25_000_000 },
    { label: '+50 Jt', value: 5_000_0000 },
];

function getDateOffset(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() + months);

    return d.toISOString().split('T')[0];
}

export default function SavingsGoalForm({
    goal,
}: {
    goal?: SavingsGoalFormData;
}) {
    const isEditing = goal !== undefined;
    const form = isEditing ? update.form.patch(goal.id) : store.form();
    const cancelHref = isEditing ? show.url(goal.id) : index.url();

    const [name, setName] = useState(goal?.name ?? '');
    const [targetAmount, setTargetAmount] = useState<number | ''>(
        goal?.target_amount ?? '',
    );
    const [targetDate, setTargetDate] = useState(goal?.target_date ?? '');

    const addAmount = (added: number) => {
        const current = typeof targetAmount === 'number' ? targetAmount : 0;
        setTargetAmount(current + added);
    };

    return (
        <Card variant="navbar">
            <CardContent className="grid gap-5 p-5 sm:p-6">
                <div className="flex items-start gap-3 border-b border-border/70 pb-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <Target className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-foreground">
                            {isEditing
                                ? 'Informasi target'
                                : 'Target tabungan baru'}
                        </h2>
                        <p className="mt-1 text-sm leading-6 font-light text-muted-foreground">
                            Tentukan impian finansial Anda, nominal target, dan
                            tenggat waktu pencapaiannya.
                        </p>
                    </div>
                </div>

                <Form {...form} className="grid gap-5">
                    {({ errors, processing }) => (
                        <>
                            {/* Nama Target */}
                            <div className="grid gap-2">
                                <TextField
                                    label="Nama target"
                                    name="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Dana darurat 6 bulan"
                                    maxLength={120}
                                    required
                                    autoFocus
                                    error={errors.name}
                                />
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                        Inspirasi:
                                    </span>
                                    {POPULAR_GOALS.map((preset) => (
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

                            {/* Target Nominal */}
                            <div className="grid gap-2">
                                <div className="flex items-baseline justify-between">
                                    <label
                                        htmlFor="target_amount"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Target nominal{' '}
                                        <span className="text-danger">*</span>
                                    </label>
                                    {typeof targetAmount === 'number' &&
                                        targetAmount > 0 && (
                                            <span className="text-xs font-semibold text-primary">
                                                {formatRupiah(targetAmount)}
                                            </span>
                                        )}
                                </div>
                                <div className="relative">
                                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                                        Rp
                                    </span>
                                    <input
                                        id="target_amount"
                                        name="target_amount"
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={targetAmount}
                                        onChange={(e) =>
                                            setTargetAmount(
                                                e.target.value === ''
                                                    ? ''
                                                    : Number(e.target.value),
                                            )
                                        }
                                        placeholder="0"
                                        required
                                        className={cn(
                                            'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface py-2.5 pr-4 pl-10 text-sm font-medium text-foreground shadow-[var(--control-shadow)] placeholder:text-muted-foreground focus:ring-1 focus:outline-none',
                                            errors.target_amount &&
                                                'border-danger focus:border-danger focus:ring-danger',
                                        )}
                                    />
                                </div>
                                {errors.target_amount && (
                                    <p className="text-xs text-danger">
                                        {errors.target_amount}
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
                                            onClick={() =>
                                                addAmount(chip.value)
                                            }
                                            className="rounded-lg border border-border/80 bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary-soft hover:text-primary active:scale-95"
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                    {typeof targetAmount === 'number' &&
                                        targetAmount > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setTargetAmount('')
                                                }
                                                className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-surface px-2 py-1 text-xs font-light text-muted-foreground hover:bg-danger/10 hover:text-danger"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                Reset
                                            </button>
                                        )}
                                </div>
                            </div>

                            {/* Target Tanggal */}
                            <div className="grid gap-2">
                                <TextField
                                    label="Target tanggal (opsional)"
                                    name="target_date"
                                    type="date"
                                    value={targetDate}
                                    onChange={(e) =>
                                        setTargetDate(e.target.value)
                                    }
                                    error={errors.target_date}
                                />
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    <span className="text-[11px] font-medium text-muted-foreground">
                                        Pintasan waktu:
                                    </span>
                                    {[
                                        { label: '3 Bulan', months: 3 },
                                        { label: '6 Bulan', months: 6 },
                                        { label: '1 Tahun', months: 12 },
                                        { label: '2 Tahun', months: 24 },
                                        { label: '5 Tahun', months: 60 },
                                    ].map((opt) => (
                                        <button
                                            key={opt.label}
                                            type="button"
                                            onClick={() =>
                                                setTargetDate(
                                                    getDateOffset(opt.months),
                                                )
                                            }
                                            className={cn(
                                                'rounded-lg border px-2 py-0.5 text-xs font-normal transition-all',
                                                targetDate ===
                                                    getDateOffset(opt.months)
                                                    ? 'border-primary bg-primary-soft text-primary'
                                                    : 'border-border/80 bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground',
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                    {targetDate && (
                                        <button
                                            type="button"
                                            onClick={() => setTargetDate('')}
                                            className="rounded-lg border border-border/80 bg-surface px-2 py-0.5 text-xs font-light text-muted-foreground hover:text-danger"
                                        >
                                            Tanpa batas waktu
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary-soft/60 p-3.5 dark:border-border dark:bg-background/60">
                                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <p className="text-xs leading-5 font-light text-muted-foreground">
                                    Tanggal target bersifat fleksibel sebagai
                                    panduan rencana tabungan Anda. Anda tetap
                                    dapat menyetor kapan saja sebelum atau
                                    setelah tanggal tersebut.
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
                                        : 'Buat target'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}

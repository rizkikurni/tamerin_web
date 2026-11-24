import { Form } from '@inertiajs/react';
import {
    CalendarClock,
    HandCoins,
    RotateCcw,
    Save,
    Sparkles,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

import { TextAreaField, TextField } from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { index, show, store, update } from '@/routes/obligations';
import type { ObligationFormData, SelectOption } from '@/types';

type Props = {
    obligation?: ObligationFormData;
    kindOptions: SelectOption[];
    defaultStartedOn?: string;
};

const COUNTERPARTY_SUGGESTIONS = [
    'Teman / Kerabat',
    'Keluarga',
    'Koperasi Karyawan',
    'Bank BCA / Mandiri',
    'Kartu Kredit / Paylater',
    'Rekan Bisnis',
];

const AMOUNT_PRESETS = [
    { label: '+500rb', value: 500_000 },
    { label: '+1 Jt', value: 1_000_000 },
    { label: '+5 Jt', value: 5_000_000 },
    { label: '+10 Jt', value: 10_000_000 },
    { label: '+25 Jt', value: 25_000_000 },
    { label: '+50 Jt', value: 50_000_000 },
];

function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);

    return d.toISOString().split('T')[0];
}

function getDateOffset(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() + months);

    return d.toISOString().split('T')[0];
}

export default function ObligationForm({
    obligation,
    kindOptions,
    defaultStartedOn,
}: Props) {
    const isEditing = obligation !== undefined;
    const form = isEditing ? update.form.patch(obligation.id) : store.form();

    const [kind, setKind] = useState(
        obligation?.kind ?? kindOptions[0]?.value ?? 'debt',
    );
    const [counterpartyName, setCounterpartyName] = useState(
        obligation?.counterparty_name ?? '',
    );
    const [originalAmount, setOriginalAmount] = useState<number | ''>(
        obligation?.original_amount ?? '',
    );
    const [startedOn, setStartedOn] = useState(
        obligation?.started_on ?? defaultStartedOn ?? getTodayString(),
    );
    const [dueOn, setDueOn] = useState(obligation?.due_on ?? '');

    const addOriginalAmount = (added: number) => {
        const current = typeof originalAmount === 'number' ? originalAmount : 0;
        setOriginalAmount(current + added);
    };

    return (
        <Card variant="navbar">
            <CardContent className="grid gap-5 p-5 sm:p-6">
                <div className="flex items-start gap-3 border-b border-border/70 pb-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <HandCoins className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-foreground">
                            {isEditing ? 'Informasi kewajiban' : 'Catatan baru'}
                        </h2>
                        <p className="mt-1 text-sm leading-6 font-light text-muted-foreground">
                            Catat utang yang harus Anda bayar atau piutang yang
                            perlu Anda tagih ke pihak lain.
                        </p>
                    </div>
                </div>

                <Form {...form} className="grid gap-5">
                    {({ errors, processing }) => (
                        <>
                            {/* Segmented Kind Toggle: Utang vs Piutang */}
                            <div className="grid gap-2">
                                <label
                                    htmlFor="kind"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Jenis catatan{' '}
                                    <span className="text-danger">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        disabled={isEditing}
                                        onClick={() => setKind('debt')}
                                        className={cn(
                                            'flex flex-col items-center justify-center gap-1 rounded-2xl border p-3.5 text-center transition-all',
                                            kind === 'debt'
                                                ? 'border-danger/60 bg-danger/10 text-danger shadow-sm ring-1 ring-danger/30'
                                                : 'border-border/80 bg-surface text-muted-foreground hover:border-danger/30 hover:text-foreground',
                                            isEditing &&
                                                'cursor-not-allowed opacity-60',
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                                            <TrendingDown className="h-4 w-4 text-danger" />
                                            Utang (Kewajiban)
                                        </div>
                                        <span className="text-[11px] font-light">
                                            Saya berutang & harus membayar
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isEditing}
                                        onClick={() => setKind('receivable')}
                                        className={cn(
                                            'flex flex-col items-center justify-center gap-1 rounded-2xl border p-3.5 text-center transition-all',
                                            kind === 'receivable'
                                                ? 'border-success/60 bg-success/10 text-success shadow-sm ring-1 ring-success/30'
                                                : 'border-border/80 bg-surface text-muted-foreground hover:border-success/30 hover:text-foreground',
                                            isEditing &&
                                                'cursor-not-allowed opacity-60',
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                                            <TrendingUp className="h-4 w-4 text-success" />
                                            Piutang (Tagihan)
                                        </div>
                                        <span className="text-[11px] font-light">
                                            Orang lain berutang ke saya
                                        </span>
                                    </button>
                                </div>
                                <input
                                    id="kind"
                                    type="hidden"
                                    name="kind"
                                    value={kind}
                                />
                                {errors.kind && (
                                    <p className="text-xs text-danger">
                                        {errors.kind}
                                    </p>
                                )}
                            </div>

                            {/* Nama Pihak */}
                            <div className="grid gap-2">
                                <TextField
                                    label="Nama pihak (orang / lembaga)"
                                    name="counterparty_name"
                                    value={counterpartyName}
                                    onChange={(e) =>
                                        setCounterpartyName(e.target.value)
                                    }
                                    placeholder={
                                        kind === 'debt'
                                            ? 'Contoh: Bank BCA atau Koperasi'
                                            : 'Contoh: Budi atau Rekan Bisnis'
                                    }
                                    maxLength={120}
                                    required
                                    autoFocus
                                    error={errors.counterparty_name}
                                />
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                        Inspirasi:
                                    </span>
                                    {COUNTERPARTY_SUGGESTIONS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() =>
                                                setCounterpartyName(preset)
                                            }
                                            className={cn(
                                                'rounded-lg border px-2 py-0.5 text-xs font-normal transition-all',
                                                counterpartyName === preset
                                                    ? 'border-primary bg-primary-soft text-primary'
                                                    : 'border-border/80 bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground',
                                            )}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Nominal Awal */}
                            <div className="grid gap-2">
                                <div className="flex items-baseline justify-between">
                                    <label
                                        htmlFor="original_amount"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Nominal awal{' '}
                                        <span className="text-danger">*</span>
                                    </label>
                                    {typeof originalAmount === 'number' &&
                                        originalAmount > 0 && (
                                            <span className="text-xs font-semibold text-primary">
                                                {formatRupiah(originalAmount)}
                                            </span>
                                        )}
                                </div>
                                <div className="relative">
                                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                                        Rp
                                    </span>
                                    <input
                                        id="original_amount"
                                        name="original_amount"
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={originalAmount}
                                        onChange={(e) =>
                                            setOriginalAmount(
                                                e.target.value === ''
                                                    ? ''
                                                    : Number(e.target.value),
                                            )
                                        }
                                        placeholder="0"
                                        required
                                        className={cn(
                                            'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface py-2.5 pr-4 pl-10 text-sm font-medium text-foreground shadow-[var(--control-shadow)] placeholder:text-muted-foreground focus:ring-1 focus:outline-none',
                                            errors.original_amount &&
                                                'border-danger focus:border-danger focus:ring-danger',
                                        )}
                                    />
                                </div>
                                {errors.original_amount && (
                                    <p className="text-xs text-danger">
                                        {errors.original_amount}
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
                                                addOriginalAmount(chip.value)
                                            }
                                            className="rounded-lg border border-border/80 bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary-soft hover:text-primary active:scale-95"
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                    {typeof originalAmount === 'number' &&
                                        originalAmount > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOriginalAmount('')
                                                }
                                                className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-surface px-2 py-1 text-xs font-light text-muted-foreground hover:bg-danger/10 hover:text-danger"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                Reset
                                            </button>
                                        )}
                                </div>
                            </div>

                            {/* Tanggal Mulai & Jatuh Tempo */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="started_on"
                                            className="text-xs font-medium text-foreground"
                                        >
                                            Tanggal mulai{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setStartedOn(
                                                        getTodayString(),
                                                    )
                                                }
                                                className={cn(
                                                    'rounded px-1.5 py-0.5 text-[11px] transition-colors',
                                                    startedOn ===
                                                        getTodayString()
                                                        ? 'bg-primary-soft font-semibold text-primary'
                                                        : 'text-muted-foreground hover:text-foreground',
                                                )}
                                            >
                                                Hari ini
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setStartedOn(
                                                        getYesterdayString(),
                                                    )
                                                }
                                                className={cn(
                                                    'rounded px-1.5 py-0.5 text-[11px] transition-colors',
                                                    startedOn ===
                                                        getYesterdayString()
                                                        ? 'bg-primary-soft font-semibold text-primary'
                                                        : 'text-muted-foreground hover:text-foreground',
                                                )}
                                            >
                                                Kemarin
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        id="started_on"
                                        name="started_on"
                                        type="date"
                                        value={startedOn}
                                        onChange={(e) =>
                                            setStartedOn(e.target.value)
                                        }
                                        required
                                        className={cn(
                                            'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] focus:ring-1 focus:outline-none',
                                            errors.started_on &&
                                                'border-danger focus:border-danger focus:ring-danger',
                                        )}
                                    />
                                    {errors.started_on && (
                                        <p className="text-xs text-danger">
                                            {errors.started_on}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="due_on"
                                            className="text-xs font-medium text-foreground"
                                        >
                                            Jatuh tempo (opsional)
                                        </label>
                                        <div className="flex items-center gap-1">
                                            {[
                                                { label: '1 bln', months: 1 },
                                                { label: '3 bln', months: 3 },
                                                { label: '6 bln', months: 6 },
                                                { label: '1 thn', months: 12 },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.label}
                                                    type="button"
                                                    onClick={() =>
                                                        setDueOn(
                                                            getDateOffset(
                                                                opt.months,
                                                            ),
                                                        )
                                                    }
                                                    className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                            {dueOn && (
                                                <button
                                                    type="button"
                                                    onClick={() => setDueOn('')}
                                                    className="rounded px-1.5 py-0.5 text-[11px] text-danger"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        id="due_on"
                                        name="due_on"
                                        type="date"
                                        value={dueOn}
                                        onChange={(e) =>
                                            setDueOn(e.target.value)
                                        }
                                        className={cn(
                                            'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] focus:ring-1 focus:outline-none',
                                            errors.due_on &&
                                                'border-danger focus:border-danger focus:ring-danger',
                                        )}
                                    />
                                    {errors.due_on && (
                                        <p className="text-xs text-danger">
                                            {errors.due_on}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <TextAreaField
                                label="Catatan (opsional)"
                                name="note"
                                defaultValue={obligation?.note ?? ''}
                                maxLength={500}
                                placeholder="Perjanjian, bunga, kontak, atau keterangan penting lainnya"
                                error={errors.note}
                            />

                            <div className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary-soft/60 p-3.5 dark:border-border dark:bg-background/60">
                                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <p className="text-xs leading-5 font-light text-muted-foreground">
                                    Pelunasan atau cicilan dicatat dari halaman
                                    detail dan otomatis mengurangi saldo akun
                                    (untuk utang) atau menambah saldo (untuk
                                    piutang).
                                </p>
                            </div>

                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
                                <ButtonLink
                                    href={
                                        isEditing
                                            ? show.url(obligation.id)
                                            : index.url()
                                    }
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
                                        : 'Buat catatan'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}

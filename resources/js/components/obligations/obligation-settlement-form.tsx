import { Form } from '@inertiajs/react';
import { CheckCircle2, Landmark, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { TextAreaField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { store } from '@/routes/obligations/settlements';
import type { ObligationKind, SelectOption } from '@/types';

function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);

    return d.toISOString().split('T')[0];
}

const SETTLEMENT_PRESETS = [
    { label: '+100rb', value: 100_000 },
    { label: '+500rb', value: 500_000 },
    { label: '+1 Jt', value: 1_000_000 },
    { label: '+2.5 Jt', value: 2_500_000 },
    { label: '+5 Jt', value: 5_000_000 },
];

export default function ObligationSettlementForm({
    obligationId,
    kind,
    outstandingAmount,
    accountOptions,
    defaultDate,
    idempotencyKey,
}: {
    obligationId: string;
    kind: ObligationKind;
    outstandingAmount: number;
    accountOptions: SelectOption[];
    defaultDate: string;
    idempotencyKey: string;
}) {
    const [amount, setAmount] = useState<number | ''>('');
    const [date, setDate] = useState(defaultDate || getTodayString());

    const addAmount = (added: number) => {
        const current = typeof amount === 'number' ? amount : 0;
        const next = Math.min(current + added, outstandingAmount);
        setAmount(next);
    };

    const setFullPay = () => {
        setAmount(outstandingAmount);
    };

    return (
        <Form
            {...store.form(obligationId)}
            resetOnSuccess
            className="grid gap-4"
        >
            {({ errors, processing }) => (
                <>
                    <input
                        type="hidden"
                        name="idempotency_key"
                        value={idempotencyKey}
                    />

                    {/* Nominal Pembayaran */}
                    <div className="grid gap-2">
                        <div className="flex items-baseline justify-between">
                            <label
                                htmlFor="settlement_amount"
                                className="text-sm font-medium text-foreground"
                            >
                                Nominal pembayaran{' '}
                                <span className="text-danger">*</span>
                            </label>
                            {typeof amount === 'number' && amount > 0 && (
                                <span className="text-xs font-semibold text-primary">
                                    {formatRupiah(amount)}
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                                Rp
                            </span>
                            <input
                                id="settlement_amount"
                                name="amount"
                                type="number"
                                min={1}
                                max={outstandingAmount}
                                step={1}
                                value={amount}
                                onChange={(e) =>
                                    setAmount(
                                        e.target.value === ''
                                            ? ''
                                            : Math.min(
                                                  Number(e.target.value),
                                                  outstandingAmount,
                                              ),
                                    )
                                }
                                placeholder={`Maksimal ${formatRupiah(outstandingAmount)}`}
                                required
                                autoFocus
                                className={cn(
                                    'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface py-2.5 pr-4 pl-10 text-sm font-medium text-foreground shadow-[var(--control-shadow)] placeholder:text-muted-foreground focus:ring-1 focus:outline-none',
                                    errors.amount &&
                                        'border-danger focus:border-danger focus:ring-danger',
                                )}
                            />
                        </div>
                        {errors.amount && (
                            <p className="text-xs text-danger">
                                {errors.amount}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {/* Lunasi Semua Button */}
                            <button
                                type="button"
                                onClick={setFullPay}
                                className="inline-flex items-center gap-1 rounded-lg border border-success/40 bg-success/15 px-2.5 py-1 text-xs font-semibold text-success transition-all hover:bg-success/25 active:scale-95"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Lunasi Semua ({formatRupiah(outstandingAmount)})
                            </button>

                            {SETTLEMENT_PRESETS.filter(
                                (p) => p.value < outstandingAmount,
                            ).map((preset) => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => addAmount(preset.value)}
                                    className="rounded-lg border border-border/80 bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary-soft hover:text-primary active:scale-95"
                                >
                                    {preset.label}
                                </button>
                            ))}

                            {typeof amount === 'number' && amount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setAmount('')}
                                    className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-surface px-2 py-1 text-xs font-light text-muted-foreground hover:bg-danger/10 hover:text-danger"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tanggal & Akun */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="settled_on"
                                    className="text-xs font-medium text-foreground"
                                >
                                    Tanggal transaksi{' '}
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
                                id="settled_on"
                                name="settled_on"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className={cn(
                                    'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] focus:ring-1 focus:outline-none',
                                    errors.settled_on &&
                                        'border-danger focus:border-danger focus:ring-danger',
                                )}
                            />
                            {errors.settled_on && (
                                <p className="text-xs text-danger">
                                    {errors.settled_on}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-1.5">
                            <label
                                htmlFor="account_id"
                                className="text-xs font-medium text-foreground"
                            >
                                Akun keuangan{' '}
                                <span className="text-danger">*</span>
                            </label>
                            <select
                                id="account_id"
                                name="account_id"
                                defaultValue={
                                    accountOptions.length === 1
                                        ? accountOptions[0].value
                                        : ''
                                }
                                required
                                className={cn(
                                    'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] focus:ring-1 focus:outline-none',
                                    errors.account_id &&
                                        'border-danger focus:border-danger focus:ring-danger',
                                )}
                            >
                                <option value="" disabled>
                                    Pilih akun sumber/tujuan
                                </option>
                                {accountOptions.map((account) => (
                                    <option
                                        key={account.value}
                                        value={account.value}
                                    >
                                        {account.label}
                                    </option>
                                ))}
                            </select>
                            {errors.account_id && (
                                <p className="text-xs text-danger">
                                    {errors.account_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <TextAreaField
                        label="Catatan (opsional)"
                        name="note"
                        maxLength={500}
                        placeholder="Contoh: Transfer via m-BCA cicilan ke-2"
                        error={errors.note}
                    />

                    <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft/50 p-3.5">
                        <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p className="text-xs leading-5 font-light text-muted-foreground">
                            {kind === 'debt'
                                ? 'Pembayaran utang otomatis membuat transaksi pengeluaran dan mengurangi saldo akun yang dipilih.'
                                : 'Penerimaan piutang otomatis membuat transaksi pemasukan dan menambah saldo akun yang dipilih.'}
                        </p>
                    </div>

                    <div className="flex justify-end border-t border-border pt-4">
                        <Button
                            type="submit"
                            size="sm"
                            loading={processing}
                            disabled={accountOptions.length === 0}
                            className="rounded-full px-5"
                        >
                            <Plus className="h-4 w-4" />
                            Simpan pembayaran
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

import { Form } from '@inertiajs/react';
import { ArrowRightLeft, Landmark, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { TextAreaField } from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { store } from '@/routes/savings-goals/contributions';
import { create as createTransaction } from '@/routes/transactions';
import type { SelectOption } from '@/types';

const CONTRIBUTION_PRESETS = [
    { label: '+100rb', value: 100_000 },
    { label: '+250rb', value: 250_000 },
    { label: '+500rb', value: 500_000 },
    { label: '+1jt', value: 1_000_000 },
    { label: '+2.5jt', value: 2_500_000 },
];

function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);

    return d.toISOString().split('T')[0];
}

export default function SavingsContributionForm({
    goalId,
    accountOptions,
    defaultDate,
}: {
    goalId: string;
    accountOptions: SelectOption[];
    defaultDate: string;
}) {
    const [amount, setAmount] = useState<number | ''>('');
    const [date, setDate] = useState(defaultDate);

    const addAmount = (added: number) => {
        const current = typeof amount === 'number' ? amount : 0;
        setAmount(current + added);
    };

    return (
        <Form {...store.form(goalId)} resetOnSuccess className="grid gap-4">
            {({ errors, processing }) => (
                <>
                    {/* Nominal Setoran */}
                    <div className="grid gap-2">
                        <div className="flex items-baseline justify-between">
                            <label
                                htmlFor="contribution_amount"
                                className="text-sm font-medium text-foreground"
                            >
                                Nominal setoran{' '}
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
                                id="contribution_amount"
                                name="amount"
                                type="number"
                                min={1}
                                step={1}
                                value={amount}
                                onChange={(e) =>
                                    setAmount(
                                        e.target.value === ''
                                            ? ''
                                            : Number(e.target.value),
                                    )
                                }
                                placeholder="0"
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
                            <span className="text-[11px] font-medium text-muted-foreground">
                                Tambah cepat:
                            </span>
                            {CONTRIBUTION_PRESETS.map((preset) => (
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

                    {/* Tanggal & Akun Konteks */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="contributed_on"
                                    className="text-xs font-medium text-foreground"
                                >
                                    Tanggal setoran{' '}
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
                                id="contributed_on"
                                name="contributed_on"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className={cn(
                                    'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] focus:ring-1 focus:outline-none',
                                    errors.contributed_on &&
                                        'border-danger focus:border-danger focus:ring-danger',
                                )}
                            />
                            {errors.contributed_on && (
                                <p className="text-xs text-danger">
                                    {errors.contributed_on}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-1.5">
                            <label
                                htmlFor="account_id"
                                className="text-xs font-medium text-foreground"
                            >
                                Akun konteks (opsional)
                            </label>
                            <select
                                id="account_id"
                                name="account_id"
                                defaultValue=""
                                className="border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] focus:ring-1 focus:outline-none"
                            >
                                <option value="">Tanpa akun konteks</option>
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
                        placeholder="Tambahkan catatan setoran jika ada"
                        error={errors.note}
                    />

                    <div className="grid gap-3 rounded-2xl border border-primary/20 bg-primary-soft/50 p-3.5 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="flex items-start gap-3">
                            <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <p className="text-xs leading-5 font-light text-muted-foreground">
                                Akun hanya menjadi konteks pencatatan riwayat.
                                Setoran ini tidak mengurangi saldo akun secara
                                otomatis.
                            </p>
                        </div>
                        <ButtonLink
                            href={createTransaction.url()}
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                        >
                            <ArrowRightLeft className="h-4 w-4" />
                            Buat mutasi transfer
                        </ButtonLink>
                    </div>

                    <div className="flex justify-end border-t border-border pt-4">
                        <Button
                            type="submit"
                            size="sm"
                            loading={processing}
                            className="rounded-full px-5"
                        >
                            <Plus className="h-4 w-4" />
                            Catat setoran sekarang
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

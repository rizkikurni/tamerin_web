import { Form } from '@inertiajs/react';
import {
    Banknote,
    CalendarDays,
    Check,
    Landmark,
    RotateCcw,
    Save,
    Smartphone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { TextField } from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
    FinancialAccount,
    FinancialAccountFormData,
    SelectOption,
} from '@/types';

type FinancialAccountFormProps = {
    form: { action: string; method: 'post' };
    accountTypes: SelectOption[];
    cancelUrl: string;
    account?: FinancialAccountFormData;
    defaultOpenedOn?: string;
    submitLabel: string;
};

type AccountType = FinancialAccount['type'];

const accountTypeMeta: Record<
    AccountType,
    {
        icon: LucideIcon;
        description: string;
        suggestions: string[];
    }
> = {
    bank: {
        icon: Landmark,
        description: 'Rekening tabungan & bank',
        suggestions: [
            'BCA',
            'Mandiri',
            'BRI',
            'BNI',
            'BSI',
            'Bank Jago',
            'SeaBank',
            'Blu BCA',
        ],
    },
    e_wallet: {
        icon: Smartphone,
        description: 'Dompet & pembayaran digital',
        suggestions: [
            'GoPay',
            'OVO',
            'DANA',
            'ShopeePay',
            'LinkAja',
            'Octo Pay',
        ],
    },
    cash: {
        icon: Banknote,
        description: 'Uang tunai & kas fisik',
        suggestions: [
            'Dompet Harian',
            'Kas Rumah',
            'Uang Tunai',
            'Simpanan Tunai',
        ],
    },
};

const quickBalanceAdditions = [
    { label: '+50rb', value: 50_000 },
    { label: '+100rb', value: 100_000 },
    { label: '+500rb', value: 500_000 },
    { label: '+1jt', value: 1_000_000 },
    { label: '+5jt', value: 5_000_000 },
];

function formatThousand(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 0,
    }).format(value);
}

function getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getStartOfMonthDateString(dateString: string): string {
    const [year, month] = dateString.split('-');

    if (!year || !month) {
        return getTodayDateString();
    }

    return `${year}-${month}-01`;
}

export default function FinancialAccountForm({
    form,
    accountTypes,
    cancelUrl,
    account,
    defaultOpenedOn,
    submitLabel,
}: FinancialAccountFormProps) {
    const fallbackToday = useMemo(
        () => defaultOpenedOn ?? getTodayDateString(),
        [defaultOpenedOn],
    );
    const startOfMonth = useMemo(
        () => getStartOfMonthDateString(fallbackToday),
        [fallbackToday],
    );

    const [selectedType, setSelectedType] = useState<AccountType>(
        () => account?.type ?? 'bank',
    );
    const [name, setName] = useState<string>(() => account?.name ?? '');
    const [openingBalance, setOpeningBalance] = useState<number>(
        () => account?.opening_balance ?? 0,
    );
    const [openedOn, setOpenedOn] = useState<string>(
        () => account?.opened_on ?? fallbackToday,
    );

    const activeMeta = accountTypeMeta[selectedType] ?? accountTypeMeta.bank;

    const handleBalanceInput = (rawValue: string) => {
        const digitsOnly = rawValue.replace(/\D/g, '');

        if (!digitsOnly) {
            setOpeningBalance(0);

            return;
        }

        const parsed = Number.parseInt(digitsOnly.slice(0, 15), 10);

        setOpeningBalance(Number.isNaN(parsed) ? 0 : parsed);
    };

    return (
        <Form {...form} className="grid gap-5">
            {({ errors, processing }) => (
                <>
                    <input type="hidden" name="type" value={selectedType} />
                    <input
                        type="hidden"
                        name="opening_balance"
                        value={String(openingBalance)}
                    />

                    {/* 1. Pilihan Tipe Akun Visual 1-Tap */}
                    <div className="grid gap-2">
                        <span className="text-xs font-medium text-foreground-secondary">
                            Tipe akun
                        </span>
                        <div
                            role="radiogroup"
                            aria-label="Tipe akun"
                            className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
                        >
                            {accountTypes.map((typeOption) => {
                                const typeValue =
                                    typeOption.value as AccountType;
                                const meta =
                                    accountTypeMeta[typeValue] ??
                                    accountTypeMeta.bank;
                                const Icon = meta.icon;
                                const active = selectedType === typeValue;

                                return (
                                    <button
                                        key={typeOption.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() =>
                                            setSelectedType(typeValue)
                                        }
                                        className={cn(
                                            'flex items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition-all duration-150',
                                            active
                                                ? 'border-primary/50 bg-primary-soft/80 text-foreground shadow-[var(--control-shadow-active)]'
                                                : 'border-[var(--control-border)] bg-[var(--control-background)] text-foreground-secondary hover:border-primary/30 hover:bg-surface-muted',
                                        )}
                                    >
                                        <span className="flex min-w-0 items-center gap-3">
                                            <span
                                                className={cn(
                                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                                                    active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-surface-muted text-muted-foreground',
                                                )}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-medium text-foreground">
                                                    {typeOption.label}
                                                </span>
                                                <span className="mt-0.5 block truncate text-xs font-light text-muted-foreground">
                                                    {meta.description}
                                                </span>
                                            </span>
                                        </span>
                                        {active && (
                                            <Check className="h-4 w-4 shrink-0 text-primary" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.type && (
                            <span className="text-xs font-normal text-danger">
                                {errors.type}
                            </span>
                        )}
                    </div>

                    {/* 2. Nama Akun + Chip Saran Nama Cepat */}
                    <div className="grid gap-2.5">
                        <TextField
                            label="Nama akun"
                            name="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Contoh: BCA, GoPay, Dompet Harian"
                            maxLength={80}
                            autoFocus
                            required
                            error={errors.name}
                        />

                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="mr-1 text-[11px] font-light text-muted-foreground">
                                Saran cepat:
                            </span>
                            {activeMeta.suggestions.map((suggestion) => {
                                const selected =
                                    name.trim().toLowerCase() ===
                                    suggestion.toLowerCase();

                                return (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => setName(suggestion)}
                                        className={cn(
                                            'rounded-xl border px-2.5 py-1 text-xs font-medium transition-all active:scale-95',
                                            selected
                                                ? 'border-primary/40 bg-primary-soft text-primary'
                                                : 'border-border-strong/60 bg-surface text-foreground-secondary hover:border-primary/30 hover:bg-primary-soft/60 hover:text-primary',
                                        )}
                                    >
                                        {suggestion}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Saldo Awal Besar Berformat Ribuan + Quick Nominal Chips */}
                    <div className="grid gap-2.5 rounded-2xl border border-[var(--control-border)] bg-[var(--control-background)] p-4 shadow-[var(--control-shadow)]">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="account-opening-balance-display"
                                className="text-xs font-medium text-foreground-secondary"
                            >
                                Saldo awal
                            </label>
                            {openingBalance > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setOpeningBalance(0)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-normal text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Reset ke Rp 0
                                </button>
                            )}
                        </div>

                        <div className="flex items-baseline gap-2.5 border-b border-border/80 pb-2.5 focus-within:border-primary">
                            <span className="text-lg font-medium text-muted-foreground sm:text-xl">
                                Rp
                            </span>
                            <input
                                id="account-opening-balance-display"
                                type="text"
                                inputMode="numeric"
                                value={
                                    openingBalance > 0
                                        ? formatThousand(openingBalance)
                                        : ''
                                }
                                onChange={(event) =>
                                    handleBalanceInput(event.target.value)
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-2xl font-medium tracking-tight text-foreground outline-none placeholder:font-light placeholder:text-muted-foreground/60 sm:text-3xl"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {quickBalanceAdditions.map((quick) => (
                                <button
                                    key={quick.label}
                                    type="button"
                                    onClick={() =>
                                        setOpeningBalance(
                                            (current) => current + quick.value,
                                        )
                                    }
                                    className="rounded-xl border border-border-strong/60 bg-surface px-3 py-1.5 text-xs font-medium text-foreground-secondary transition-all hover:border-primary/40 hover:bg-primary-soft hover:text-primary active:scale-95"
                                >
                                    {quick.label}
                                </button>
                            ))}
                        </div>

                        {errors.opening_balance && (
                            <span className="text-xs font-normal text-danger">
                                {errors.opening_balance}
                            </span>
                        )}
                    </div>

                    {/* 4. Tanggal Dibuka (Otomatis Hari Ini + Shortcut Cepat) */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <label
                                    htmlFor="account-opened-on-input"
                                    className="text-xs font-medium text-foreground-secondary"
                                >
                                    Tanggal dibuka
                                </label>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenedOn(fallbackToday)
                                        }
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors',
                                            openedOn === fallbackToday
                                                ? 'bg-primary-soft text-primary'
                                                : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                                        )}
                                    >
                                        <CalendarDays className="h-3 w-3" />
                                        Hari ini
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenedOn(startOfMonth)
                                        }
                                        className={cn(
                                            'rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors',
                                            openedOn === startOfMonth
                                                ? 'bg-primary-soft text-primary'
                                                : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                                        )}
                                    >
                                        Awal bulan
                                    </button>
                                </div>
                            </div>
                            <input
                                id="account-opened-on-input"
                                name="opened_on"
                                type="date"
                                value={openedOn}
                                onChange={(event) =>
                                    setOpenedOn(event.target.value)
                                }
                                required
                                className="h-11 w-full rounded-[14px] border border-[var(--control-border)] bg-[var(--control-background)] px-3.5 py-2 text-sm font-normal text-foreground shadow-[var(--control-shadow)] backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-200 outline-none hover:border-primary/35 hover:bg-surface-muted/80 focus:border-primary/60 focus:bg-surface-muted focus:ring-2 focus:ring-primary/15"
                            />
                            {errors.opened_on && (
                                <span className="text-xs font-normal text-danger">
                                    {errors.opened_on}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center rounded-2xl bg-primary-soft px-4 py-3 text-xs leading-5 font-light text-primary">
                            Saldo awal menjadi titik mulai pencatatan. Saldo
                            saat ini akan otomatis menyesuaikan setiap kali ada
                            transaksi masuk, keluar, atau transfer.
                        </div>
                    </div>

                    {/* 5. Tombol Aksi Responsif */}
                    <div className="flex flex-col-reverse gap-2.5 border-t border-border pt-5 sm:flex-row sm:justify-end">
                        <ButtonLink
                            href={cancelUrl}
                            variant="ghost"
                            size="md"
                            className="w-full sm:w-auto"
                        >
                            Batal
                        </ButtonLink>
                        <Button
                            type="submit"
                            size="md"
                            loading={processing}
                            className="w-full sm:w-auto"
                        >
                            <Save className="h-4 w-4" />
                            {submitLabel}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

import { Form } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    Banknote,
    BriefcaseBusiness,
    CalendarDays,
    Car,
    Check,
    CircleDollarSign,
    Gift,
    GraduationCap,
    HeartPulse,
    House,
    Landmark,
    RotateCcw,
    Save,
    ShoppingCart,
    Smartphone,
    Tags,
    Utensils,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { TextField } from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
    SelectOption,
    TransactionAccountOption,
    TransactionCategoryOption,
    TransactionType,
} from '@/types';

type TransactionFormProps = {
    form: { action: string; method: 'post' };
    transactionTypes: SelectOption[];
    accounts: TransactionAccountOption[];
    categories: TransactionCategoryOption[];
    idempotencyKey: string;
    defaultDate: string;
    cancelUrl: string;
};

const quickAmounts = [
    { label: '+10rb', value: 10_000 },
    { label: '+20rb', value: 20_000 },
    { label: '+50rb', value: 50_000 },
    { label: '+100rb', value: 100_000 },
    { label: '+500rb', value: 500_000 },
];

const typeVisuals: Record<
    TransactionType,
    {
        icon: LucideIcon;
        activeClass: string;
        iconClass: string;
    }
> = {
    expense: {
        icon: ArrowUpRight,
        activeClass:
            'border-danger/40 bg-danger/10 text-danger shadow-[var(--control-shadow-active)]',
        iconClass: 'text-danger',
    },
    income: {
        icon: ArrowDownLeft,
        activeClass:
            'border-success/40 bg-success/10 text-success shadow-[var(--control-shadow-active)]',
        iconClass: 'text-success',
    },
    transfer: {
        icon: ArrowLeftRight,
        activeClass:
            'border-primary/40 bg-primary-soft text-primary shadow-[var(--control-shadow-active)]',
        iconClass: 'text-primary',
    },
};

const categoryIcons: Record<string, LucideIcon> = {
    wallet: Wallet,
    'shopping-cart': ShoppingCart,
    utensils: Utensils,
    car: Car,
    'briefcase-business': BriefcaseBusiness,
    house: House,
    'heart-pulse': HeartPulse,
    'graduation-cap': GraduationCap,
    gift: Gift,
    'circle-dollar-sign': CircleDollarSign,
};

const categoryColorClasses: Record<string, string> = {
    blue: 'bg-primary-soft text-primary',
    green: 'bg-success/10 text-success',
    violet: 'bg-secondary-soft text-secondary',
    amber: 'bg-warning/10 text-warning',
    rose: 'bg-danger/10 text-danger',
};

function getAccountIcon(type?: TransactionAccountOption['type']): LucideIcon {
    if (type === 'cash') {
        return Banknote;
    }

    if (type === 'bank') {
        return Landmark;
    }

    return Smartphone;
}

function formatThousand(value: number): string {
    if (value <= 0) {
        return '';
    }

    return new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 0,
    }).format(value);
}

function subtractOneDay(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() - 1);

    return date.toISOString().slice(0, 10);
}

export default function TransactionForm({
    form,
    transactionTypes,
    accounts,
    categories,
    idempotencyKey,
    defaultDate,
    cancelUrl,
}: TransactionFormProps) {
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState<number>(0);
    const [transactedOn, setTransactedOn] = useState<string>(defaultDate);
    const [accountId, setAccountId] = useState<string>(
        () => accounts[0]?.id ?? '',
    );
    const [destinationAccountId, setDestinationAccountId] = useState<string>(
        () =>
            accounts.find((account) => account.id !== accounts[0]?.id)?.id ??
            '',
    );

    const matchingCategories = useMemo(
        () => categories.filter((category) => category.type === type),
        [categories, type],
    );

    const [selectedCategoryByType, setSelectedCategoryByType] = useState<
        Record<'income' | 'expense', string>
    >(() => ({
        expense:
            categories.find((category) => category.type === 'expense')?.id ??
            '',
        income:
            categories.find((category) => category.type === 'income')?.id ?? '',
    }));

    const isTransfer = type === 'transfer';
    const currentCategoryId = isTransfer
        ? ''
        : selectedCategoryByType[type] || matchingCategories[0]?.id || '';

    const yesterdayDate = useMemo(
        () => subtractOneDay(defaultDate),
        [defaultDate],
    );

    const hasRequiredOptions =
        accounts.length > (isTransfer ? 1 : 0) &&
        (isTransfer || matchingCategories.length > 0);

    const orderedTypes = useMemo(() => {
        const order: Record<string, number> = {
            expense: 0,
            income: 1,
            transfer: 2,
        };

        return [...transactionTypes].sort(
            (first, second) =>
                (order[first.value] ?? 99) - (order[second.value] ?? 99),
        );
    }, [transactionTypes]);

    const handleAmountInput = (rawValue: string) => {
        const digitsOnly = rawValue.replace(/\D/g, '');

        if (!digitsOnly) {
            setAmount(0);

            return;
        }

        const parsed = Number.parseInt(digitsOnly.slice(0, 15), 10);

        setAmount(Number.isNaN(parsed) ? 0 : parsed);
    };

    const handleSourceAccountSelect = (nextAccountId: string) => {
        setAccountId(nextAccountId);

        if (destinationAccountId === nextAccountId) {
            const fallbackDestination = accounts.find(
                (account) => account.id !== nextAccountId,
            );

            setDestinationAccountId(fallbackDestination?.id ?? '');
        }
    };

    return (
        <Form {...form} className="grid gap-5">
            {({ errors, processing }) => (
                <>
                    <input
                        type="hidden"
                        name="idempotency_key"
                        value={idempotencyKey}
                    />
                    <input type="hidden" name="type" value={type} />
                    <input
                        type="hidden"
                        name="amount"
                        value={amount > 0 ? String(amount) : ''}
                    />
                    <input type="hidden" name="account_id" value={accountId} />
                    {isTransfer ? (
                        <input
                            type="hidden"
                            name="destination_account_id"
                            value={destinationAccountId}
                        />
                    ) : (
                        <input
                            type="hidden"
                            name="category_id"
                            value={currentCategoryId}
                        />
                    )}

                    {/* 1. Segmented Control Tipe Transaksi */}
                    <div className="grid gap-2">
                        <span className="text-xs font-medium text-foreground-secondary">
                            Tipe transaksi
                        </span>
                        <div
                            role="radiogroup"
                            aria-label="Tipe transaksi"
                            className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--control-border)] bg-background/60 p-1.5"
                        >
                            {orderedTypes.map((transactionType) => {
                                const value =
                                    transactionType.value as TransactionType;
                                const active = type === value;
                                const visual =
                                    typeVisuals[value] ?? typeVisuals.expense;
                                const Icon = visual.icon;

                                return (
                                    <button
                                        key={transactionType.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() => setType(value)}
                                        className={cn(
                                            'flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 sm:text-sm',
                                            active
                                                ? visual.activeClass
                                                : 'border-transparent text-foreground-secondary hover:bg-surface-muted hover:text-foreground',
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'h-4 w-4 shrink-0',
                                                active
                                                    ? visual.iconClass
                                                    : 'text-muted-foreground',
                                            )}
                                        />
                                        <span className="truncate">
                                            {transactionType.label}
                                        </span>
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

                    {/* 2. Input Nominal Besar + Quick Chips */}
                    <div className="grid gap-2.5 rounded-2xl border border-[var(--control-border)] bg-[var(--control-background)] p-4 shadow-[var(--control-shadow)]">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="transaction-amount-display"
                                className="text-xs font-medium text-foreground-secondary"
                            >
                                Nominal transaksi
                            </label>
                            {amount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setAmount(0)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-normal text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className="flex items-baseline gap-2.5 border-b border-border/80 pb-2.5 focus-within:border-primary">
                            <span className="text-lg font-medium text-muted-foreground sm:text-xl">
                                Rp
                            </span>
                            <input
                                id="transaction-amount-display"
                                type="text"
                                inputMode="numeric"
                                autoFocus
                                value={formatThousand(amount)}
                                onChange={(event) =>
                                    handleAmountInput(event.target.value)
                                }
                                placeholder="0"
                                className="w-full bg-transparent text-2xl font-medium tracking-tight text-foreground outline-none placeholder:font-light placeholder:text-muted-foreground/60 sm:text-3xl"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {quickAmounts.map((quick) => (
                                <button
                                    key={quick.label}
                                    type="button"
                                    onClick={() =>
                                        setAmount(
                                            (current) => current + quick.value,
                                        )
                                    }
                                    className="rounded-xl border border-border-strong/60 bg-surface px-3 py-1.5 text-xs font-medium text-foreground-secondary transition-all hover:border-primary/40 hover:bg-primary-soft hover:text-primary active:scale-95"
                                >
                                    {quick.label}
                                </button>
                            ))}
                        </div>

                        {errors.amount && (
                            <span className="text-xs font-normal text-danger">
                                {errors.amount}
                            </span>
                        )}
                    </div>

                    {/* 3. Pilihan Akun (1-Tap Grid) */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="grid content-start gap-2">
                            <span className="text-xs font-medium text-foreground-secondary">
                                {isTransfer ? 'Akun asal' : 'Sumber akun'}
                            </span>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {accounts.map((account) => {
                                    const selected = accountId === account.id;
                                    const AccountIcon = getAccountIcon(
                                        account.type,
                                    );

                                    return (
                                        <button
                                            key={account.id}
                                            type="button"
                                            onClick={() =>
                                                handleSourceAccountSelect(
                                                    account.id,
                                                )
                                            }
                                            aria-pressed={selected}
                                            className={cn(
                                                'flex min-h-12 items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-150',
                                                selected
                                                    ? 'border-primary/50 bg-primary-soft/80 text-foreground shadow-[var(--control-shadow-active)]'
                                                    : 'border-[var(--control-border)] bg-[var(--control-background)] text-foreground-secondary hover:border-primary/30 hover:bg-surface-muted',
                                            )}
                                        >
                                            <span className="flex min-w-0 items-center gap-2.5">
                                                <span
                                                    className={cn(
                                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                                                        selected
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-surface-muted text-muted-foreground',
                                                    )}
                                                >
                                                    <AccountIcon className="h-4 w-4" />
                                                </span>
                                                <span className="truncate text-sm font-medium">
                                                    {account.name}
                                                </span>
                                            </span>
                                            {selected && (
                                                <Check className="h-4 w-4 shrink-0 text-primary" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.account_id && (
                                <span className="text-xs font-normal text-danger">
                                    {errors.account_id}
                                </span>
                            )}
                        </div>

                        {/* Akun Tujuan (Transfer) atau Tanggal & Catatan di Desktop */}
                        {isTransfer && (
                            <div className="grid content-start gap-2">
                                <span className="text-xs font-medium text-foreground-secondary">
                                    Akun tujuan
                                </span>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {accounts.map((account) => {
                                        const isSource =
                                            account.id === accountId;
                                        const selected =
                                            !isSource &&
                                            destinationAccountId === account.id;
                                        const AccountIcon = getAccountIcon(
                                            account.type,
                                        );

                                        return (
                                            <button
                                                key={account.id}
                                                type="button"
                                                disabled={isSource}
                                                onClick={() =>
                                                    setDestinationAccountId(
                                                        account.id,
                                                    )
                                                }
                                                aria-pressed={selected}
                                                className={cn(
                                                    'flex min-h-12 items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-150',
                                                    selected
                                                        ? 'border-primary/50 bg-primary-soft/80 text-foreground shadow-[var(--control-shadow-active)]'
                                                        : 'border-[var(--control-border)] bg-[var(--control-background)] text-foreground-secondary hover:border-primary/30 hover:bg-surface-muted',
                                                    isSource &&
                                                        'cursor-not-allowed opacity-40',
                                                )}
                                            >
                                                <span className="flex min-w-0 items-center gap-2.5">
                                                    <span
                                                        className={cn(
                                                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                                                            selected
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-surface-muted text-muted-foreground',
                                                        )}
                                                    >
                                                        <AccountIcon className="h-4 w-4" />
                                                    </span>
                                                    <span className="truncate text-sm font-medium">
                                                        {account.name}
                                                    </span>
                                                </span>
                                                {selected && (
                                                    <Check className="h-4 w-4 shrink-0 text-primary" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.destination_account_id && (
                                    <span className="text-xs font-normal text-danger">
                                        {errors.destination_account_id}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 4. Pilihan Kategori (1-Tap Visual Grid) */}
                    {!isTransfer && (
                        <div className="grid gap-2">
                            <span className="text-xs font-medium text-foreground-secondary">
                                Kategori{' '}
                                {type === 'income'
                                    ? 'pemasukan'
                                    : 'pengeluaran'}
                            </span>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                {matchingCategories.map((category) => {
                                    const selected =
                                        currentCategoryId === category.id;
                                    const CategoryIcon =
                                        categoryIcons[category.icon ?? ''] ??
                                        Tags;
                                    const badgeColor =
                                        categoryColorClasses[
                                            category.color_token ?? ''
                                        ] ??
                                        'bg-surface-muted text-muted-foreground';

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedCategoryByType(
                                                    (current) => ({
                                                        ...current,
                                                        [type]: category.id,
                                                    }),
                                                )
                                            }
                                            aria-pressed={selected}
                                            className={cn(
                                                'flex min-h-12 items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 text-left transition-all duration-150',
                                                selected
                                                    ? 'border-primary/50 bg-primary-soft/75 text-foreground shadow-[var(--control-shadow-active)]'
                                                    : 'border-[var(--control-border)] bg-[var(--control-background)] text-foreground-secondary hover:border-primary/30 hover:bg-surface-muted',
                                            )}
                                        >
                                            <span className="flex min-w-0 items-center gap-2.5">
                                                <span
                                                    className={cn(
                                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                                                        badgeColor,
                                                    )}
                                                >
                                                    <CategoryIcon className="h-4 w-4" />
                                                </span>
                                                <span className="truncate text-xs font-medium sm:text-sm">
                                                    {category.name}
                                                </span>
                                            </span>
                                            {selected && (
                                                <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.category_id && (
                                <span className="text-xs font-normal text-danger">
                                    {errors.category_id}
                                </span>
                            )}
                        </div>
                    )}

                    {/* 5. Tanggal (dengan Shortcut Hari Ini / Kemarin) & Catatan Ringkas */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <label
                                    htmlFor="transaction-date-input"
                                    className="text-xs font-medium text-foreground-secondary"
                                >
                                    Tanggal transaksi
                                </label>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTransactedOn(defaultDate)
                                        }
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors',
                                            transactedOn === defaultDate
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
                                            setTransactedOn(yesterdayDate)
                                        }
                                        className={cn(
                                            'rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors',
                                            transactedOn === yesterdayDate
                                                ? 'bg-primary-soft text-primary'
                                                : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                                        )}
                                    >
                                        Kemarin
                                    </button>
                                </div>
                            </div>
                            <input
                                id="transaction-date-input"
                                name="transacted_on"
                                type="date"
                                value={transactedOn}
                                onChange={(event) =>
                                    setTransactedOn(event.target.value)
                                }
                                required
                                className="h-11 w-full rounded-[14px] border border-[var(--control-border)] bg-[var(--control-background)] px-3.5 py-2 text-sm font-normal text-foreground shadow-[var(--control-shadow)] backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-200 outline-none hover:border-primary/35 hover:bg-surface-muted/80 focus:border-primary/60 focus:bg-surface-muted focus:ring-2 focus:ring-primary/15"
                            />
                            {errors.transacted_on && (
                                <span className="text-xs font-normal text-danger">
                                    {errors.transacted_on}
                                </span>
                            )}
                        </div>

                        <TextField
                            label="Catatan (opsional)"
                            name="note"
                            maxLength={500}
                            placeholder="Contoh: Makan siang, bensin, dll."
                            error={errors.note}
                        />
                    </div>

                    {!hasRequiredOptions && (
                        <p className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-xs leading-5 font-light text-warning">
                            Data aktif belum mencukupi untuk tipe transaksi ini.
                            Tambahkan akun atau kategori yang sesuai terlebih
                            dahulu.
                        </p>
                    )}

                    {/* 6. Tombol Aksi Ergonomis untuk HP, Tablet, dan Laptop */}
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
                            disabled={!hasRequiredOptions}
                            className="w-full sm:w-auto"
                        >
                            <Save className="h-4 w-4" />
                            Catat Transaksi
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

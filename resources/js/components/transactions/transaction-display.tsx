import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { TransactionType } from '@/types';

export const transactionTypeConfig: Record<
    TransactionType,
    {
        label: string;
        icon: LucideIcon;
        iconClass: string;
        backgroundClass: string;
        amountClass: string;
        prefix: string;
        badge: 'success' | 'danger' | 'default';
    }
> = {
    income: {
        label: 'Pemasukan',
        icon: ArrowDownLeft,
        iconClass: 'text-success',
        backgroundClass: 'bg-success/10',
        amountClass: 'text-success',
        prefix: '+',
        badge: 'success',
    },
    expense: {
        label: 'Pengeluaran',
        icon: ArrowUpRight,
        iconClass: 'text-danger',
        backgroundClass: 'bg-danger/10',
        amountClass: 'text-danger',
        prefix: '-',
        badge: 'danger',
    },
    transfer: {
        label: 'Transfer',
        icon: ArrowLeftRight,
        iconClass: 'text-primary',
        backgroundClass: 'bg-primary-soft',
        amountClass: 'text-foreground',
        prefix: '',
        badge: 'default',
    },
};

export function TransactionTypeIcon({ type }: { type: TransactionType }) {
    const config = transactionTypeConfig[type];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                config.backgroundClass,
            )}
        >
            <Icon className={cn('h-5 w-5', config.iconClass)} />
        </div>
    );
}

export function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatTransactionDate(value: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
}

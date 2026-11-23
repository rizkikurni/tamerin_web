import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    BriefcaseBusiness,
    Car,
    CircleDollarSign,
    Gift,
    GraduationCap,
    HeartPulse,
    House,
    ShoppingCart,
    Utensils,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { TransactionCategoryRelation, TransactionType } from '@/types';

const categoryIconMap: Record<string, LucideIcon> = {
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

const categoryColorMap: Record<
    string,
    { backgroundClass: string; iconClass: string }
> = {
    blue: {
        backgroundClass: 'bg-primary-soft',
        iconClass: 'text-primary',
    },
    green: {
        backgroundClass: 'bg-success/10',
        iconClass: 'text-success',
    },
    violet: {
        backgroundClass: 'bg-secondary-soft',
        iconClass: 'text-secondary',
    },
    amber: {
        backgroundClass: 'bg-warning/10',
        iconClass: 'text-warning',
    },
    rose: {
        backgroundClass: 'bg-danger/10',
        iconClass: 'text-danger',
    },
};

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

export function TransactionTypeIcon({
    type,
    category,
}: {
    type: TransactionType;
    category?: TransactionCategoryRelation | null;
}) {
    const config = transactionTypeConfig[type];
    const CategoryIcon = category?.icon
        ? categoryIconMap[category.icon]
        : undefined;
    const categoryColor = category?.color_token
        ? categoryColorMap[category.color_token]
        : undefined;

    const Icon = CategoryIcon ?? config.icon;
    const backgroundClass =
        categoryColor?.backgroundClass ?? config.backgroundClass;
    const iconClass = categoryColor?.iconClass ?? config.iconClass;

    return (
        <div
            className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                backgroundClass,
            )}
        >
            <Icon className={cn('h-5 w-5', iconClass)} />
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

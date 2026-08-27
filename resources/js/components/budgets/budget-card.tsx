import {
    BriefcaseBusiness,
    Car,
    CircleDollarSign,
    Gift,
    GraduationCap,
    HeartPulse,
    House,
    Pencil,
    ShoppingCart,
    Tags,
    Utensils,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import Badge from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import IconButton from '@/components/ui/icon-button';
import Progress from '@/components/ui/progress';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { BudgetListItem, BudgetStatus } from '@/types';

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

const colorClasses: Record<string, string> = {
    blue: 'bg-primary-soft text-primary',
    green: 'bg-success/10 text-success',
    violet: 'bg-secondary-soft text-secondary',
    amber: 'bg-warning/10 text-warning',
    rose: 'bg-danger/10 text-danger',
};

const statusConfig: Record<
    BudgetStatus,
    { label: string; variant: 'success' | 'warning' | 'danger' }
> = {
    safe: { label: 'Aman', variant: 'success' },
    warning: { label: 'Mendekati batas', variant: 'warning' },
    reached: { label: 'Batas tercapai', variant: 'warning' },
    over: { label: 'Melebihi budget', variant: 'danger' },
};

export default function BudgetCard({
    budget,
    onEdit,
}: {
    budget: BudgetListItem;
    onEdit: () => void;
}) {
    const Icon = categoryIcons[budget.category.icon ?? ''] ?? Tags;
    const iconColorClass =
        colorClasses[budget.category.color_token ?? ''] ??
        'bg-surface-muted text-muted-foreground';
    const status = statusConfig[budget.status];

    return (
        <Card
            variant="navbar"
            className="transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:border-[var(--glass-border-strong)] hover:bg-surface/95 hover:shadow-[var(--glass-shadow-hover)]"
        >
            <CardContent className="grid gap-4 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            className={cn(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                                iconColorClass,
                            )}
                        >
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-medium text-foreground">
                                {budget.category.name}
                            </h2>
                            <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                Batas {formatRupiah(budget.amount)}
                            </p>
                        </div>
                    </div>
                    <IconButton
                        label={`Ubah budget ${budget.category.name}`}
                        onClick={onEdit}
                        icon={<Pencil className="h-4 w-4" />}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-background/40 p-3">
                    <div>
                        <p className="text-xs font-light text-muted-foreground">
                            Terpakai
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                            {formatRupiah(budget.spent)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-light text-muted-foreground">
                            {budget.remaining >= 0 ? 'Sisa' : 'Kelebihan'}
                        </p>
                        <p
                            className={cn(
                                'mt-1 text-sm font-medium',
                                budget.remaining < 0
                                    ? 'text-danger'
                                    : 'text-foreground',
                            )}
                        >
                            {formatRupiah(Math.abs(budget.remaining))}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Progress value={budget.spent} max={budget.amount} />
                    <div className="flex items-center justify-between gap-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <span className="text-xs font-medium text-foreground-secondary">
                            {budget.percentage}%
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

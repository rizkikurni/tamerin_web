import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronRight,
    Coins,
    Package,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';

import Badge from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { assetTypeLabels } from '@/lib/finance-labels';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { show } from '@/routes/assets';
import type { AssetListItem } from '@/types';

export default function AssetCard({ asset }: { asset: AssetListItem }) {
    const hasDiff = asset.estimated_difference !== null;
    const differencePositive = (asset.estimated_difference ?? 0) >= 0;

    return (
        <Card
            variant="navbar"
            className="group relative flex h-full flex-col justify-between transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--control-shadow-hover)]"
        >
            <CardContent className="grid gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <Link
                        href={show.url(asset.id)}
                        className="flex min-w-0 flex-1 items-center gap-3"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-transform group-hover:scale-105">
                            <Package className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
                                {asset.name}
                            </h2>
                            <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                {assetTypeLabels[asset.asset_type]}
                            </p>
                        </div>
                    </Link>
                    <Badge
                        variant={
                            asset.status === 'active' ? 'success' : 'muted'
                        }
                    >
                        {asset.status === 'active' ? 'Aktif' : 'Diarsipkan'}
                    </Badge>
                </div>

                {/* Nilai saat ini */}
                <div className="rounded-2xl border border-primary/10 bg-primary-soft/45 p-3.5 dark:border-border dark:bg-background/45">
                    <p className="text-[11px] font-light text-muted-foreground">
                        Estimasi Nilai Saat Ini
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                        {formatRupiah(asset.current_value)}
                    </p>
                    {hasDiff && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium">
                            {differencePositive ? (
                                <span className="inline-flex items-center gap-1 text-success">
                                    <TrendingUp className="h-3.5 w-3.5" />+
                                    {formatRupiah(asset.estimated_difference!)}{' '}
                                    dari modal
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-danger">
                                    <TrendingDown className="h-3.5 w-3.5" />
                                    {formatRupiah(
                                        asset.estimated_difference!,
                                    )}{' '}
                                    dari modal
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Tanggal & Modal */}
                <div className="flex items-center justify-between gap-3 text-xs font-light text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Dinilai {formatDate(asset.valued_on)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Coins className="h-3.5 w-3.5" />
                        {asset.acquisition_cost === null
                            ? 'Modal tidak dicatat'
                            : formatRupiah(asset.acquisition_cost)}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end border-t border-border/70 pt-3">
                    <ButtonLink
                        href={show.url(asset.id)}
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full px-3 text-xs"
                    >
                        Detail
                        <ChevronRight className="h-3.5 w-3.5" />
                    </ButtonLink>
                </div>
            </CardContent>
        </Card>
    );
}

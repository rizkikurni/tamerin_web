import { Link } from '@inertiajs/react';
import { CalendarDays, Package } from 'lucide-react';

import Badge from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { assetTypeLabels } from '@/lib/finance-labels';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { show } from '@/routes/assets';
import type { AssetListItem } from '@/types';

export default function AssetCard({ asset }: { asset: AssetListItem }) {
    const differencePositive = (asset.estimated_difference ?? 0) >= 0;

    return (
        <Link href={show.url(asset.id)} className="group block">
            <Card
                variant="navbar"
                className="h-full transition-[transform,border-color,box-shadow] group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-[var(--control-shadow-hover)]"
            >
                <CardContent className="grid h-full gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                                <Package className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="truncate text-base font-medium text-foreground">
                                    {asset.name}
                                </h2>
                                <p className="mt-1 text-xs font-light text-muted-foreground">
                                    {assetTypeLabels[asset.asset_type]}
                                </p>
                            </div>
                        </div>
                        <Badge
                            variant={
                                asset.status === 'active' ? 'success' : 'muted'
                            }
                        >
                            {asset.status === 'active' ? 'Aktif' : 'Diarsipkan'}
                        </Badge>
                    </div>

                    <div className="rounded-2xl border border-border bg-background/55 p-3.5">
                        <p className="text-xs font-light text-muted-foreground">
                            Nilai saat ini
                        </p>
                        <p className="mt-1 text-lg font-medium text-foreground">
                            {formatRupiah(asset.current_value)}
                        </p>
                        {asset.estimated_difference !== null && (
                            <p
                                className={`mt-1 text-xs ${differencePositive ? 'text-success' : 'text-danger'}`}
                            >
                                {differencePositive ? '+' : ''}
                                {formatRupiah(asset.estimated_difference)} dari
                                nilai perolehan
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs font-light text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Dinilai {formatDate(asset.valued_on)}
                        </span>
                        <span>
                            {asset.acquisition_cost === null
                                ? 'Modal tidak dicatat'
                                : formatRupiah(asset.acquisition_cost)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

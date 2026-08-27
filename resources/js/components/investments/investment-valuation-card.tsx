import { CalendarDays, CircleX } from 'lucide-react';

import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatRupiah } from '@/lib/formatters';
import type { InvestmentValuation } from '@/types';

export default function InvestmentValuationCard({
    valuation,
    onVoid,
}: {
    valuation: InvestmentValuation;
    onVoid?: () => void;
}) {
    const isActive = valuation.status === 'active';

    return (
        <Card className={!isActive ? 'opacity-70' : undefined}>
            <CardContent className="grid gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-base font-medium text-foreground">
                            {formatRupiah(valuation.value)}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-light text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(valuation.valued_on)}
                        </p>
                    </div>
                    <Badge variant={isActive ? 'success' : 'muted'}>
                        {isActive ? 'Aktif' : 'Dibatalkan'}
                    </Badge>
                </div>

                {valuation.note && (
                    <p className="rounded-xl bg-surface-muted/65 px-3 py-2 text-xs leading-5 font-light text-muted-foreground">
                        {valuation.note}
                    </p>
                )}

                {isActive && onVoid && (
                    <div className="flex justify-end border-t border-border/70 pt-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:text-danger"
                            onClick={onVoid}
                        >
                            <CircleX className="h-4 w-4" />
                            Batalkan valuasi
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

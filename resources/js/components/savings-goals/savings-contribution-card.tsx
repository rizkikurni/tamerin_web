import { Ban, CalendarDays, FileText, Landmark } from 'lucide-react';

import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { SavingsContributionListItem } from '@/types';

export default function SavingsContributionCard({
    contribution,
    onVoid,
}: {
    contribution: SavingsContributionListItem;
    onVoid: () => void;
}) {
    const isVoided = contribution.status === 'voided';

    return (
        <Card
            variant="navbar"
            className={cn(isVoided && 'border-border/70 opacity-80')}
        >
            <CardContent className="grid gap-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p
                                className={cn(
                                    'text-base font-medium text-foreground',
                                    isVoided && 'line-through',
                                )}
                            >
                                {formatRupiah(contribution.amount)}
                            </p>
                            <Badge variant={isVoided ? 'muted' : 'success'}>
                                {isVoided ? 'Dibatalkan' : 'Aktif'}
                            </Badge>
                        </div>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-light text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(contribution.contributed_on)}
                        </p>
                    </div>

                    {!isVoided && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-danger/10"
                            onClick={onVoid}
                        >
                            <Ban className="h-4 w-4" />
                            Batalkan
                        </Button>
                    )}
                </div>

                <div className="grid gap-2 border-t border-border/70 pt-3 text-xs font-light text-muted-foreground sm:grid-cols-2">
                    <p className="inline-flex items-start gap-2">
                        <Landmark className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {contribution.account?.name ?? 'Tanpa akun konteks'}
                    </p>
                    <p className="inline-flex items-start gap-2">
                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {contribution.note ?? 'Tanpa catatan'}
                    </p>
                </div>

                {isVoided && contribution.void_reason && (
                    <div className="rounded-xl border border-danger/20 bg-danger/5 p-3">
                        <p className="text-xs font-medium text-danger">
                            Alasan pembatalan
                        </p>
                        <p className="mt-1 text-xs leading-5 font-light text-muted-foreground">
                            {contribution.void_reason}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

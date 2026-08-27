import { CalendarDays, Landmark, ReceiptText } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { show } from '@/routes/transactions';
import type { ObligationSettlement } from '@/types';

export default function ObligationSettlementCard({
    settlement,
}: {
    settlement: ObligationSettlement;
}) {
    return (
        <Card variant="navbar">
            <CardContent className="grid gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-base font-medium text-foreground">
                            {formatRupiah(settlement.amount)}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-light text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(settlement.settled_on)}
                        </p>
                    </div>
                    <ButtonLink
                        href={show.url(settlement.transaction.id)}
                        variant="outline"
                        size="sm"
                    >
                        <ReceiptText className="h-4 w-4" />
                        Transaksi
                    </ButtonLink>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background/55 px-3 py-2 text-xs font-light text-muted-foreground">
                    <Landmark className="h-3.5 w-3.5 text-primary" />
                    {settlement.account.name}
                </div>
                {settlement.note && (
                    <p className="text-xs leading-5 font-light text-muted-foreground">
                        {settlement.note}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

import { Link } from '@inertiajs/react';
import { Banknote, Landmark, Smartphone } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { index as accountsIndex } from '@/routes/financial-accounts';
import type { DashboardAccount } from '@/types';

const accountTypeLabels: Record<DashboardAccount['type'], string> = {
    cash: 'Tunai',
    bank: 'Bank',
    e_wallet: 'Dompet digital',
};

const contributionColors = [
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'bg-warning',
    'bg-muted-foreground',
];

function AccountIcon({ type }: { type: DashboardAccount['type'] }) {
    const Icon =
        type === 'cash' ? Banknote : type === 'bank' ? Landmark : Smartphone;

    return <Icon className="h-4 w-4 text-primary" />;
}

export default function AccountSummary({
    accounts,
}: {
    accounts: DashboardAccount[];
}) {
    return (
        <Card variant="navbar" className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-foreground">
                        Akun Keuangan
                    </h3>
                    <Link
                        href={accountsIndex.url()}
                        className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                        Lihat semua
                    </Link>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {accounts.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border p-5 text-center text-sm font-light text-muted-foreground">
                        Belum ada akun aktif.
                    </p>
                ) : (
                    <>
                        {accounts.map((account) => (
                            <div
                                key={account.id}
                                className="flex items-center justify-between gap-3 rounded-xl p-1"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                                        <AccountIcon type={account.type} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {account.name}
                                        </p>
                                        <p className="text-xs font-light text-muted-foreground">
                                            {accountTypeLabels[account.type]}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-sm font-medium text-foreground">
                                        {formatRupiah(account.balance)}
                                    </p>
                                    <p className="text-xs font-light text-muted-foreground">
                                        {account.contribution}%
                                    </p>
                                </div>
                            </div>
                        ))}

                        <div className="flex h-2 overflow-hidden rounded-full bg-surface-muted">
                            {accounts.map((account, index) => (
                                <div
                                    key={account.id}
                                    className={cn(
                                        'h-full transition-all',
                                        contributionColors[
                                            index % contributionColors.length
                                        ],
                                        index > 0 && 'ml-0.5',
                                    )}
                                    style={{
                                        width: `${Math.max(account.contribution, 0)}%`,
                                    }}
                                    title={`${account.name}: ${account.contribution}%`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

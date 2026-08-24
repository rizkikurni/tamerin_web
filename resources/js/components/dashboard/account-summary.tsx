import { Landmark } from 'lucide-react';

import Badge from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Dummy data — akan diganti di Fase 8
const accounts = [
    {
        name: 'BCA',
        type: 'Bank',
        balance: 5200000,
        contribution: 41.6,
    },
    {
        name: 'Mandiri',
        type: 'Bank',
        balance: 3800000,
        contribution: 30.4,
    },
    {
        name: 'GoPay',
        type: 'E-Wallet',
        balance: 1500000,
        contribution: 12.0,
    },
    {
        name: 'OVO',
        type: 'E-Wallet',
        balance: 1200000,
        contribution: 9.6,
    },
    {
        name: 'Kas',
        type: 'Tunai',
        balance: 800000,
        contribution: 6.4,
    },
];

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export default function AccountSummary() {
    return (
        <Card variant="glass">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-foreground">
                        Akun Keuangan
                    </h3>
                    <a
                        href="/accounts"
                        className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                        Lihat semua
                    </a>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {accounts.map((account) => (
                    <div
                        key={account.name}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
                                <Landmark className="h-4 w-4 text-primary" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {account.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {account.type}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                                {formatRupiah(account.balance)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {account.contribution}%
                            </p>
                        </div>
                    </div>
                ))}

                {/* Contribution bar */}
                <div className="mt-1 flex h-2 overflow-hidden rounded-full">
                    {accounts.map((account, index) => {
                        const colors = [
                            'bg-primary',
                            'bg-secondary',
                            'bg-accent',
                            'bg-warning',
                            'bg-muted-foreground',
                        ];

                        return (
                            <div
                                key={account.name}
                                className={cn(
                                    'h-full transition-all',
                                    colors[index % colors.length],
                                    index > 0 && 'ml-0.5',
                                )}
                                style={{ width: `${account.contribution}%` }}
                                title={`${account.name}: ${account.contribution}%`}
                            />
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

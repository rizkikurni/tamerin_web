import { BarChart3, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const chartBars = [44, 62, 52, 78, 58, 86, 72];

export default function DashboardPreview() {
    return (
        <div
            className="relative mx-auto w-full max-w-2xl"
            aria-label="Pratinjau dashboard Tamerin"
        >
            <div className="absolute -inset-12 -z-10 rounded-full bg-primary/10 blur-3xl" />
            <div className="rounded-[28px] border border-[var(--glass-border-strong)] bg-surface/90 p-3 shadow-[var(--popup-shadow)] backdrop-blur-xl sm:p-5">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Ringkasan bulan ini
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                            Dashboard keuangan
                        </p>
                    </div>
                    <div className="flex gap-1.5" aria-hidden="true">
                        <span className="size-2 rounded-full bg-danger" />
                        <span className="size-2 rounded-full bg-warning" />
                        <span className="size-2 rounded-full bg-success" />
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <PreviewMetric
                        label="Total saldo"
                        value="Rp24,8 jt"
                        icon={WalletCards}
                        iconClassName="text-primary"
                    />
                    <PreviewMetric
                        label="Pemasukan"
                        value="Rp8,4 jt"
                        icon={TrendingUp}
                        iconClassName="text-success"
                    />
                    <PreviewMetric
                        label="Pengeluaran"
                        value="Rp5,1 jt"
                        icon={TrendingDown}
                        iconClassName="text-danger"
                    />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-[1.45fr_1fr]">
                    <div className="rounded-2xl border border-[var(--glass-border)] bg-background/55 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Arus kas
                                </p>
                                <p className="mt-1 text-sm font-medium text-foreground">
                                    7 bulan terakhir
                                </p>
                            </div>
                            <BarChart3 className="size-5 text-primary" />
                        </div>
                        <div className="mt-6 flex h-24 items-end gap-2">
                            {chartBars.map((height, index) => (
                                <div
                                    key={`${height}-${index}`}
                                    className="flex-1 rounded-t-md bg-primary/25"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="h-2/5 rounded-t-md bg-primary" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-[var(--glass-border)] bg-background/55 p-4">
                        <p className="text-xs text-muted-foreground">
                            Anggaran terpakai
                        </p>
                        <div className="mx-auto my-4 grid size-24 place-items-center rounded-full bg-[conic-gradient(var(--primary)_0_68%,var(--surface-tinted)_68%_100%)]">
                            <div className="grid size-16 place-items-center rounded-full bg-surface text-sm font-medium text-foreground">
                                68%
                            </div>
                        </div>
                        <p className="text-center text-xs text-foreground-secondary">
                            Masih dalam batas aman
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface PreviewMetricProps {
    label: string;
    value: string;
    icon: LucideIcon;
    iconClassName: string;
}

function PreviewMetric({
    label,
    value,
    icon: Icon,
    iconClassName,
}: PreviewMetricProps) {
    return (
        <div className="rounded-2xl border border-[var(--glass-border)] bg-background/55 p-4">
            <Icon className={`mb-4 size-5 ${iconClassName}`} />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-lg font-medium text-foreground">{value}</p>
        </div>
    );
}

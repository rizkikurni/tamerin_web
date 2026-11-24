import {
    AlertTriangle,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Coins,
    Gauge,
    HandCoins,
    Layers3,
    PiggyBank,
    ReceiptText,
    Target,
    TrendingDown,
    TrendingUp,
    Wallet,
    WalletCards,
} from 'lucide-react';
import type { ReactNode } from 'react';

import SummaryCard from '@/components/dashboard/summary-card';
import { formatRupiah } from '@/lib/formatters';

const labels: Record<string, string> = {
    transaction_count: 'Jumlah Transaksi',
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    transfer: 'Transfer',
    net_cash_flow: 'Arus Kas Bersih',
    allocated: 'Total Budget',
    spent: 'Terpakai',
    remaining: 'Sisa Budget',
    over_budget_count: 'Melebihi Budget',
    total_target: 'Total Target',
    total_saved: 'Total Terkumpul',
    completed_count: 'Target Selesai',
    current_value: 'Nilai Saat Ini',
    acquisition_cost: 'Modal Investasi',
    profit_loss: 'Untung / Rugi',
    stale_count: 'Perlu Diperbarui',
    net_worth: 'Kekayaan Bersih',
    total_assets: 'Total Aset',
    debts: 'Total Kewajiban',
    original_amount: 'Nominal Awal',
    outstanding_amount: 'Total Outstanding',
    debt_outstanding: 'Sisa Utang',
    receivable_outstanding: 'Sisa Piutang',
    settled_count: 'Sudah Lunas',
};

const countKeys = new Set([
    'transaction_count',
    'over_budget_count',
    'completed_count',
    'stale_count',
    'settled_count',
]);

function getMetricConfig(
    key: string,
    value: number,
): { icon: ReactNode; iconBg: string } {
    switch (key) {
        case 'income':
            return {
                icon: <TrendingUp className="h-5 w-5 text-success" />,
                iconBg: 'bg-success/10',
            };
        case 'expense':
            return {
                icon: <TrendingDown className="h-5 w-5 text-danger" />,
                iconBg: 'bg-danger/10',
            };
        case 'net_cash_flow':
        case 'profit_loss':
            return {
                icon: (
                    <CircleDollarSign
                        className={`h-5 w-5 ${value >= 0 ? 'text-success' : 'text-danger'}`}
                    />
                ),
                iconBg: value >= 0 ? 'bg-success/10' : 'bg-danger/10',
            };
        case 'transaction_count':
            return {
                icon: <ReceiptText className="h-5 w-5 text-primary" />,
                iconBg: 'bg-primary-soft',
            };
        case 'allocated':
            return {
                icon: <Layers3 className="h-5 w-5 text-primary" />,
                iconBg: 'bg-primary-soft',
            };
        case 'spent':
            return {
                icon: <Gauge className="h-5 w-5 text-accent" />,
                iconBg: 'bg-accent-soft',
            };
        case 'remaining':
        case 'completed_count':
        case 'settled_count':
            return {
                icon: <CheckCircle2 className="h-5 w-5 text-success" />,
                iconBg: 'bg-success/10',
            };
        case 'over_budget_count':
            return {
                icon: <AlertTriangle className="h-5 w-5 text-danger" />,
                iconBg: 'bg-danger/10',
            };
        case 'total_target':
            return {
                icon: <Target className="h-5 w-5 text-primary" />,
                iconBg: 'bg-primary-soft',
            };
        case 'total_saved':
            return {
                icon: <PiggyBank className="h-5 w-5 text-success" />,
                iconBg: 'bg-success/10',
            };
        case 'current_value':
        case 'total_assets':
            return {
                icon: <TrendingUp className="h-5 w-5 text-primary" />,
                iconBg: 'bg-primary-soft',
            };
        case 'acquisition_cost':
            return {
                icon: <Coins className="h-5 w-5 text-accent" />,
                iconBg: 'bg-accent-soft',
            };
        case 'net_worth':
            return {
                icon: <Wallet className="h-5 w-5 text-primary" />,
                iconBg: 'bg-primary-soft',
            };
        case 'stale_count':
            return {
                icon: <Clock3 className="h-5 w-5 text-warning" />,
                iconBg: 'bg-warning/10',
            };
        case 'debt_outstanding':
        case 'debts':
            return {
                icon: <HandCoins className="h-5 w-5 text-danger" />,
                iconBg: 'bg-danger/10',
            };
        case 'receivable_outstanding':
            return {
                icon: <HandCoins className="h-5 w-5 text-success" />,
                iconBg: 'bg-success/10',
            };
        default:
            return {
                icon: <WalletCards className="h-5 w-5 text-primary" />,
                iconBg: 'bg-primary-soft',
            };
    }
}

export default function ReportSummary({
    summary,
}: {
    summary: Record<string, number>;
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(summary).map(([key, value]) => {
                const config = getMetricConfig(key, value);

                return (
                    <SummaryCard
                        key={key}
                        title={labels[key] ?? key.replaceAll('_', ' ')}
                        value={
                            countKeys.has(key)
                                ? new Intl.NumberFormat('id-ID').format(value)
                                : formatRupiah(value)
                        }
                        icon={config.icon}
                        iconBg={config.iconBg}
                    />
                );
            })}
        </div>
    );
}

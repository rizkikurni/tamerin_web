import { CircleDollarSign, Gauge, Layers3, WalletCards } from 'lucide-react';

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
    remaining: 'Sisa',
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

export default function ReportSummary({
    summary,
}: {
    summary: Record<string, number>;
}) {
    const icons = [WalletCards, CircleDollarSign, Gauge, Layers3];

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(summary).map(([key, value], index) => {
                const Icon = icons[index % icons.length];

                return (
                    <SummaryCard
                        key={key}
                        title={labels[key] ?? key.replaceAll('_', ' ')}
                        value={
                            countKeys.has(key)
                                ? new Intl.NumberFormat('id-ID').format(value)
                                : formatRupiah(value)
                        }
                        icon={<Icon className="h-5 w-5 text-primary" />}
                    />
                );
            })}
        </div>
    );
}

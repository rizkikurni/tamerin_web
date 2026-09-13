<?php

namespace App\Queries\Reports;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;

class CashFlowReportQuery
{
    public function __construct(private TransactionReportQuery $transactionReportQuery) {}

    /** @param array{report_type: string, date_from: string, date_to: string, account_id: string|null, category_id: string|null, status: string|null} $filters
     * @return array<string, mixed>
     */
    public function get(User $user, array $filters, int $perPage = 15): array
    {
        $filters['status'] = TransactionStatus::Posted->value;
        $query = $this->transactionReportQuery
            ->filteredQuery($user, $filters)
            ->whereIn('type', [TransactionType::Income, TransactionType::Expense]);

        $summary = (clone $query)
            ->toBase()
            ->selectRaw('COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS income', [TransactionType::Income->value])
            ->selectRaw('COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS expense', [TransactionType::Expense->value])
            ->first();
        $income = (int) ($summary->income ?? 0);
        $expense = (int) ($summary->expense ?? 0);

        $chart = (clone $query)
            ->select('transacted_on')
            ->selectRaw('SUM(CASE WHEN type = ? THEN amount ELSE 0 END) AS income', [TransactionType::Income->value])
            ->selectRaw('SUM(CASE WHEN type = ? THEN amount ELSE 0 END) AS expense', [TransactionType::Expense->value])
            ->groupBy('transacted_on')
            ->orderBy('transacted_on')
            ->get()
            ->map(fn (Transaction $transaction): array => [
                'date' => $transaction->transacted_on->toDateString(),
                'income' => (int) $transaction->getAttribute('income'),
                'expense' => (int) $transaction->getAttribute('expense'),
            ])
            ->values()
            ->all();

        $details = (clone $query)
            ->select(['category_id', 'type'])
            ->selectRaw('SUM(amount) AS total')
            ->selectRaw('COUNT(*) AS transaction_count')
            ->with('category:id,name')
            ->groupBy(['category_id', 'type'])
            ->orderByDesc('total')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Transaction $transaction): array => [
                'category' => $transaction->category_id === null
                    ? 'Tanpa kategori'
                    : $transaction->category->name,
                'type' => $transaction->type->value,
                'transaction_count' => (int) $transaction->getAttribute('transaction_count'),
                'total' => (int) $transaction->getAttribute('total'),
            ]);

        return [
            'type' => 'cash_flow',
            'title' => 'Laporan Arus Kas',
            'summary' => [
                'income' => $income,
                'expense' => $expense,
                'net_cash_flow' => $income - $expense,
            ],
            'columns' => [
                ['key' => 'category', 'label' => 'Kategori', 'format' => 'text'],
                ['key' => 'type', 'label' => 'Jenis', 'format' => 'status'],
                ['key' => 'transaction_count', 'label' => 'Transaksi', 'format' => 'number'],
                ['key' => 'total', 'label' => 'Total', 'format' => 'currency'],
            ],
            'details' => $details,
            'chart' => array_values($chart),
        ];
    }
}

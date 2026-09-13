<?php

namespace App\Queries\Reports;

use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class TransactionReportQuery
{
    /** @param array{report_type: string, date_from: string, date_to: string, account_id: string|null, category_id: string|null, status: string|null} $filters
     * @return array<string, mixed>
     */
    public function get(User $user, array $filters, int $perPage = 15): array
    {
        $query = $this->filteredQuery($user, $filters);
        $summary = (clone $query)
            ->toBase()
            ->selectRaw('COUNT(*) AS transaction_count')
            ->selectRaw('COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS income', [TransactionType::Income->value])
            ->selectRaw('COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS expense', [TransactionType::Expense->value])
            ->selectRaw('COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS transfer', [TransactionType::Transfer->value])
            ->first();

        $details = $query
            ->select([
                'id', 'type', 'amount', 'transacted_on', 'account_id',
                'destination_account_id', 'category_id', 'note', 'status', 'created_at',
            ])
            ->with(['account:id,name', 'destinationAccount:id,name', 'category:id,name'])
            ->orderByDesc('transacted_on')
            ->latest('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Transaction $transaction): array => [
                'id' => $transaction->id,
                'date' => $transaction->transacted_on->toDateString(),
                'type' => $transaction->type->value,
                'account' => $transaction->account->name,
                'destination' => $transaction->destinationAccount?->name,
                'category' => $transaction->category_id === null
                    ? 'Tanpa kategori'
                    : $transaction->category->name,
                'amount' => $transaction->amount,
                'status' => $transaction->status->value,
            ]);

        return [
            'type' => 'transactions',
            'title' => 'Laporan Transaksi',
            'summary' => [
                'transaction_count' => (int) ($summary->transaction_count ?? 0),
                'income' => (int) ($summary->income ?? 0),
                'expense' => (int) ($summary->expense ?? 0),
                'transfer' => (int) ($summary->transfer ?? 0),
            ],
            'columns' => [
                ['key' => 'date', 'label' => 'Tanggal', 'format' => 'date'],
                ['key' => 'type', 'label' => 'Jenis', 'format' => 'status'],
                ['key' => 'account', 'label' => 'Akun', 'format' => 'text'],
                ['key' => 'category', 'label' => 'Kategori', 'format' => 'text'],
                ['key' => 'amount', 'label' => 'Nominal', 'format' => 'currency'],
                ['key' => 'status', 'label' => 'Status', 'format' => 'status'],
            ],
            'details' => $details,
            'chart' => [],
        ];
    }

    /** @param array{date_from: string, date_to: string, account_id: string|null, category_id: string|null, status: string|null, report_type: string} $filters
     * @return Builder<Transaction>
     */
    public function filteredQuery(User $user, array $filters): Builder
    {
        return Transaction::query()
            ->whereBelongsTo($user)
            ->whereBetween('transacted_on', [$filters['date_from'], $filters['date_to']])
            ->when($filters['account_id'], function (Builder $query, string $accountId): void {
                $query->where(function (Builder $accountQuery) use ($accountId): void {
                    $accountQuery->where('account_id', $accountId)
                        ->orWhere('destination_account_id', $accountId);
                });
            })
            ->when(
                $filters['category_id'],
                fn (Builder $query, string $categoryId): Builder => $query->where('category_id', $categoryId),
            )
            ->when(
                $filters['status'],
                fn (Builder $query, string $status): Builder => $query->where('status', $status),
            );
    }
}

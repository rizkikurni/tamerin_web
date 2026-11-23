<?php

namespace App\Queries\Transactions;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class TransactionIndexQuery
{
    /**
     * @param array{
     *     date_from: string|null,
     *     date_to: string|null,
     *     type: string|null,
     *     account_id: string|null,
     *     category_id: string|null,
     *     status: string|null
     * } $filters
     * @return LengthAwarePaginator<int, covariant array{
     *     id: string,
     *     type: string,
     *     amount: int,
     *     transacted_on: string,
     *     note: string|null,
     *     status: string,
     *     voided_at: string|null,
     *     account: array{id: string, name: string},
     *     destination_account: array{id: string, name: string}|null,
     *     category: array{id: string, name: string, type: string, color_token: string|null, icon: string|null}|null
     * }>
     */
    public function paginate(User $user, array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($user, $filters)
            ->select([
                'id',
                'user_id',
                'type',
                'amount',
                'transacted_on',
                'account_id',
                'destination_account_id',
                'category_id',
                'note',
                'status',
                'voided_at',
                'void_reason',
                'created_at',
            ])
            ->with([
                'account:id,name',
                'destinationAccount:id,name',
                'category:id,name,type,color_token,icon',
            ])
            ->orderByDesc('transacted_on')
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through($this->toIndexItem(...));
    }

    /**
     * @param array{
     *     date_from: string|null,
     *     date_to: string|null,
     *     type: string|null,
     *     account_id: string|null,
     *     category_id: string|null,
     *     status: string|null
     * } $filters
     * @return array{
     *     totalIncome: int,
     *     totalExpense: int,
     *     netCashFlow: int,
     *     transactionCount: int
     * }
     */
    public function summary(User $user, array $filters): array
    {
        $baseQuery = $this->filteredQuery($user, $filters);
        $transactionCount = (clone $baseQuery)->count();

        $totals = (clone $baseQuery)
            ->where('status', TransactionStatus::Posted)
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS total_income',
                [TransactionType::Income->value],
            )
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS total_expense',
                [TransactionType::Expense->value],
            )
            ->first();

        $totalIncome = (int) ($totals?->getAttribute('total_income') ?? 0);
        $totalExpense = (int) ($totals?->getAttribute('total_expense') ?? 0);

        return [
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'netCashFlow' => $totalIncome - $totalExpense,
            'transactionCount' => $transactionCount,
        ];
    }

    /**
     * @param array{
     *     date_from: string|null,
     *     date_to: string|null,
     *     type: string|null,
     *     account_id: string|null,
     *     category_id: string|null,
     *     status: string|null
     * } $filters
     * @return Builder<Transaction>
     */
    private function filteredQuery(User $user, array $filters): Builder
    {
        return Transaction::query()
            ->whereBelongsTo($user)
            ->when($filters['date_from'], fn (Builder $query, string $date): Builder => $query
                ->whereDate('transacted_on', '>=', $date))
            ->when($filters['date_to'], fn (Builder $query, string $date): Builder => $query
                ->whereDate('transacted_on', '<=', $date))
            ->when($filters['type'], fn (Builder $query, string $type): Builder => $query
                ->where('type', $type))
            ->when($filters['account_id'], function (Builder $query, string $accountId): void {
                $query->where(function (Builder $accountQuery) use ($accountId): void {
                    $accountQuery->where('account_id', $accountId)
                        ->orWhere('destination_account_id', $accountId);
                });
            })
            ->when($filters['category_id'], fn (Builder $query, string $categoryId): Builder => $query
                ->where('category_id', $categoryId))
            ->when($filters['status'], fn (Builder $query, string $status): Builder => $query
                ->where('status', $status));
    }

    /**
     * @return array{
     *     id: string,
     *     type: string,
     *     amount: int,
     *     transacted_on: string,
     *     note: string|null,
     *     status: string,
     *     voided_at: string|null,
     *     account: array{id: string, name: string},
     *     destination_account: array{id: string, name: string}|null,
     *     category: array{id: string, name: string, type: string, color_token: string|null, icon: string|null}|null
     * }
     */
    private function toIndexItem(Transaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'type' => $transaction->type->value,
            'amount' => $transaction->amount,
            'transacted_on' => $transaction->transacted_on->toDateString(),
            'note' => $transaction->note,
            'status' => $transaction->status->value,
            'voided_at' => $transaction->voided_at?->toISOString(),
            'account' => [
                'id' => $transaction->account->id,
                'name' => $transaction->account->name,
            ],
            'destination_account' => $transaction->destinationAccount === null
                ? null
                : [
                    'id' => $transaction->destinationAccount->id,
                    'name' => $transaction->destinationAccount->name,
                ],
            'category' => $transaction->category === null
                ? null
                : [
                    'id' => $transaction->category->id,
                    'name' => $transaction->category->name,
                    'type' => $transaction->category->type->value,
                    'color_token' => $transaction->category->color_token,
                    'icon' => $transaction->category->icon,
                ],
        ];
    }
}

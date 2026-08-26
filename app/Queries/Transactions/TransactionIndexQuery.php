<?php

namespace App\Queries\Transactions;

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
     *     category: array{id: string, name: string, type: string}|null
     * }>
     */
    public function paginate(User $user, array $filters): LengthAwarePaginator
    {
        return Transaction::query()
            ->whereBelongsTo($user)
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
                'category:id,name,type',
            ])
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
                ->where('status', $status))
            ->orderByDesc('transacted_on')
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through($this->toIndexItem(...));
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
     *     category: array{id: string, name: string, type: string}|null
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
                ],
        ];
    }
}

<?php

namespace App\Queries\Dashboard;

use App\Models\Transaction;
use App\Models\User;

class RecentTransactionQuery
{
    /**
     * @return list<array{
     *     id: string,
     *     date: string,
     *     type: string,
     *     label: string,
     *     account: string,
     *     note: string|null,
     *     amount: int,
     *     status: string
     * }>
     */
    public function get(User $user, int $limit = 7): array
    {
        $transactions = Transaction::query()
            ->whereBelongsTo($user)
            ->select([
                'id',
                'type',
                'amount',
                'transacted_on',
                'account_id',
                'destination_account_id',
                'category_id',
                'note',
                'status',
                'created_at',
            ])
            ->with([
                'account:id,name',
                'destinationAccount:id,name',
                'category:id,name',
            ])
            ->orderByDesc('transacted_on')
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Transaction $transaction): array => [
                'id' => $transaction->id,
                'date' => $transaction->transacted_on->toDateString(),
                'type' => $transaction->type->value,
                'label' => $transaction->category_id === null
                    ? 'Transfer'
                    : $transaction->category->name,
                'account' => $transaction->destinationAccount === null
                    ? $transaction->account->name
                    : "{$transaction->account->name} ke {$transaction->destinationAccount->name}",
                'note' => $transaction->note,
                'amount' => $transaction->amount,
                'status' => $transaction->status->value,
            ])
            ->values()
            ->all();

        return array_values($transactions);
    }
}

<?php

namespace App\Queries\Obligations;

use App\Enums\FinancialAccountStatus;
use App\Models\FinancialAccount;
use App\Models\Obligation;
use App\Models\ObligationSettlement;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class ObligationDetailQuery
{
    public function __construct(private ObligationIndexQuery $indexQuery) {}

    /** @return array<string, mixed> */
    public function obligation(Obligation $obligation): array
    {
        return $this->indexQuery->item($obligation);
    }

    /** @return LengthAwarePaginator<int, covariant array<string, mixed>> */
    public function settlements(Obligation $obligation): LengthAwarePaginator
    {
        return ObligationSettlement::query()
            ->whereBelongsTo($obligation)
            ->where('user_id', $obligation->user_id)
            ->select([
                'id',
                'account_id',
                'transaction_id',
                'amount',
                'settled_on',
                'note',
                'created_at',
            ])
            ->with([
                'account:id,name',
                'transaction:id,type,status',
            ])
            ->latest('settled_on')
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ObligationSettlement $settlement): array => [
                'id' => $settlement->id,
                'amount' => $settlement->amount,
                'settled_on' => $settlement->settled_on->toDateString(),
                'note' => $settlement->note,
                'account' => [
                    'id' => $settlement->account->id,
                    'name' => $settlement->account->name,
                ],
                'transaction' => [
                    'id' => $settlement->transaction->id,
                    'type' => $settlement->transaction->type->value,
                    'status' => $settlement->transaction->status->value,
                ],
            ]);
    }

    /** @return list<array{value: string, label: string}> */
    public function accountOptions(User $user): array
    {
        $options = FinancialAccount::query()
            ->whereBelongsTo($user)
            ->where('status', FinancialAccountStatus::Active)
            ->whereNull('archived_at')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (FinancialAccount $account): array => [
                'value' => $account->id,
                'label' => $account->name,
            ])
            ->values()
            ->all();

        return array_values($options);
    }
}

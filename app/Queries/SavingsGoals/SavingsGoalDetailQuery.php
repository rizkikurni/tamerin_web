<?php

namespace App\Queries\SavingsGoals;

use App\Enums\FinancialAccountStatus;
use App\Enums\SavingsContributionStatus;
use App\Enums\SavingsGoalStatus;
use App\Models\FinancialAccount;
use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * @phpstan-type ContributionItem array{
 *     id: string,
 *     amount: int,
 *     contributed_on: string,
 *     note: string|null,
 *     status: SavingsContributionStatus,
 *     voided_at: string|null,
 *     void_reason: string|null,
 *     account: array{id: string, name: string}|null
 * }
 */
class SavingsGoalDetailQuery
{
    /**
     * @return array{
     *     id: string,
     *     name: string,
     *     target_amount: int,
     *     saved_amount: int,
     *     remaining_amount: int,
     *     percentage: float,
     *     target_date: string|null,
     *     status: SavingsGoalStatus,
     *     completed_at: string|null,
     *     archived_at: string|null
     * }
     */
    public function goal(SavingsGoal $goal): array
    {
        $goal->loadSum([
            'contributions as saved_amount' => fn (Builder $query): Builder => $query
                ->where('status', SavingsContributionStatus::Active),
        ], 'amount');

        $savedAmount = (int) $goal->getAttribute('saved_amount');
        $percentage = ($savedAmount / $goal->target_amount) * 100;

        return [
            'id' => $goal->id,
            'name' => $goal->name,
            'target_amount' => $goal->target_amount,
            'saved_amount' => $savedAmount,
            'remaining_amount' => max($goal->target_amount - $savedAmount, 0),
            'percentage' => round($percentage, 1),
            'target_date' => $goal->target_date?->toDateString(),
            'status' => $goal->status,
            'completed_at' => $goal->completed_at?->toISOString(),
            'archived_at' => $goal->archived_at?->toISOString(),
        ];
    }

    /** @return LengthAwarePaginator<int, covariant ContributionItem> */
    public function contributions(SavingsGoal $goal): LengthAwarePaginator
    {
        return SavingsContribution::query()
            ->whereBelongsTo($goal, 'savingsGoal')
            ->where('user_id', $goal->user_id)
            ->select([
                'id',
                'account_id',
                'amount',
                'contributed_on',
                'note',
                'status',
                'voided_at',
                'void_reason',
                'created_at',
            ])
            ->with('account:id,name')
            ->latest('contributed_on')
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through($this->toContributionItem(...));
    }

    /** @return list<array{value: string, label: string}> */
    public function accountOptions(User $user): array
    {
        $options = FinancialAccount::query()
            ->whereBelongsTo($user)
            ->where('status', FinancialAccountStatus::Active)
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

    /** @return ContributionItem */
    private function toContributionItem(SavingsContribution $contribution): array
    {
        return [
            'id' => $contribution->id,
            'amount' => $contribution->amount,
            'contributed_on' => $contribution->contributed_on->toDateString(),
            'note' => $contribution->note,
            'status' => $contribution->status,
            'voided_at' => $contribution->voided_at?->toISOString(),
            'void_reason' => $contribution->void_reason,
            'account' => $contribution->account === null
                ? null
                : [
                    'id' => $contribution->account->id,
                    'name' => $contribution->account->name,
                ],
        ];
    }
}

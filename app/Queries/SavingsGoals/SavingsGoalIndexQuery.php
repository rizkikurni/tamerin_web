<?php

namespace App\Queries\SavingsGoals;

use App\Enums\SavingsContributionStatus;
use App\Enums\SavingsGoalStatus;
use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * @phpstan-type SavingsGoalListItem array{
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
class SavingsGoalIndexQuery
{
    /**
     * @param  array{status: string|null}  $filters
     * @return LengthAwarePaginator<int, covariant SavingsGoalListItem>
     */
    public function paginate(User $user, array $filters): LengthAwarePaginator
    {
        return SavingsGoal::query()
            ->whereBelongsTo($user)
            ->select([
                'id',
                'name',
                'target_amount',
                'target_date',
                'status',
                'completed_at',
                'archived_at',
                'created_at',
            ])
            ->withSum([
                'contributions as saved_amount' => fn (Builder $query): Builder => $query
                    ->where('status', SavingsContributionStatus::Active),
            ], 'amount')
            ->when(
                $filters['status'],
                fn (Builder $query, string $status): Builder => $query->where('status', $status),
            )
            ->orderByRaw('target_date ASC NULLS LAST')
            ->latest('created_at')
            ->paginate(12)
            ->withQueryString()
            ->through($this->toIndexItem(...));
    }

    /** @return array{activeCount: int, totalTarget: int, totalSaved: int, completedCount: int} */
    public function summary(User $user): array
    {
        $goalTotals = SavingsGoal::query()
            ->whereBelongsTo($user)
            ->toBase()
            ->selectRaw('COUNT(CASE WHEN status = ? THEN 1 END) AS active_count', [
                SavingsGoalStatus::Active->value,
            ])
            ->selectRaw('COUNT(CASE WHEN status = ? THEN 1 END) AS completed_count', [
                SavingsGoalStatus::Completed->value,
            ])
            ->selectRaw('COALESCE(SUM(CASE WHEN status <> ? THEN target_amount ELSE 0 END), 0) AS total_target', [
                SavingsGoalStatus::Archived->value,
            ])
            ->first();

        $nonArchivedGoalIds = SavingsGoal::query()
            ->whereBelongsTo($user)
            ->where('status', '!=', SavingsGoalStatus::Archived)
            ->select('id');

        $totalSaved = SavingsContribution::query()
            ->whereBelongsTo($user)
            ->where('status', SavingsContributionStatus::Active)
            ->whereIn('savings_goal_id', $nonArchivedGoalIds)
            ->sum('amount');

        return [
            'activeCount' => (int) ($goalTotals->active_count ?? 0),
            'totalTarget' => (int) ($goalTotals->total_target ?? 0),
            'totalSaved' => (int) $totalSaved,
            'completedCount' => (int) ($goalTotals->completed_count ?? 0),
        ];
    }

    /** @return SavingsGoalListItem */
    private function toIndexItem(SavingsGoal $goal): array
    {
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
}

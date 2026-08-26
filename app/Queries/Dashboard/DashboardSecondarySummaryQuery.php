<?php

namespace App\Queries\Dashboard;

use App\Enums\InvestmentHoldingStatus;
use App\Enums\InvestmentValuationStatus;
use App\Enums\SavingsContributionStatus;
use App\Enums\SavingsGoalStatus;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class DashboardSecondarySummaryQuery
{
    /**
     * @return array{
     *     savingsGoal: array{id: string, name: string, current: int, target: int, targetDate: string|null, percentage: float}|null,
     *     investment: array{id: string, name: string, type: string, value: int, change: float|null, valuedOn: string|null}|null
     * }
     */
    public function get(User $user): array
    {
        $savingsGoal = SavingsGoal::query()
            ->whereBelongsTo($user)
            ->where('status', SavingsGoalStatus::Active)
            ->select(['id', 'name', 'target_amount', 'target_date'])
            ->withSum([
                'contributions as saved_amount' => fn (Builder $query): Builder => $query
                    ->where('status', SavingsContributionStatus::Active),
            ], 'amount')
            ->orderByRaw('target_date ASC NULLS LAST')
            ->oldest('created_at')
            ->first();

        $holdingIdColumn = (new InvestmentHolding)->qualifyColumn('id');
        $latestValuation = InvestmentValuation::query()
            ->whereBelongsTo($user)
            ->where('status', InvestmentValuationStatus::Active)
            ->whereColumn('investment_holding_id', $holdingIdColumn)
            ->latest('valued_on')
            ->limit(1);

        $holding = InvestmentHolding::query()
            ->whereBelongsTo($user)
            ->where('status', InvestmentHoldingStatus::Active)
            ->select([
                'id',
                'name',
                'instrument_type',
                'acquisition_cost',
                'last_valuation_at',
            ])
            ->addSelect([
                'latest_value' => (clone $latestValuation)->select('value'),
                'latest_valued_on' => (clone $latestValuation)->select('valued_on'),
            ])
            ->orderByRaw('last_valuation_at ASC NULLS FIRST')
            ->first();

        $savings = null;

        if ($savingsGoal !== null) {
            $current = (int) $savingsGoal->getAttribute('saved_amount');
            $target = (int) $savingsGoal->getAttribute('target_amount');
            $targetDate = $savingsGoal->getAttribute('target_date');

            $savings = [
                'id' => $savingsGoal->id,
                'name' => (string) $savingsGoal->getAttribute('name'),
                'current' => $current,
                'target' => $target,
                'targetDate' => $targetDate?->toDateString(),
                'percentage' => round(min(($current / $target) * 100, 100), 1),
            ];
        }

        $investment = null;

        if ($holding !== null) {
            $value = (int) $holding->getAttribute('latest_value');
            $cost = (int) $holding->getAttribute('acquisition_cost');

            $investment = [
                'id' => $holding->id,
                'name' => (string) $holding->getAttribute('name'),
                'type' => $holding->instrument_type->value,
                'value' => $value,
                'change' => $cost > 0 && $value > 0
                    ? round((($value - $cost) / $cost) * 100, 1)
                    : null,
                'valuedOn' => $holding->getAttribute('latest_valued_on'),
            ];
        }

        return [
            'savingsGoal' => $savings,
            'investment' => $investment,
        ];
    }
}

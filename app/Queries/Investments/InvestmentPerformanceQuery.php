<?php

namespace App\Queries\Investments;

use App\Enums\InvestmentHoldingStatus;
use App\Models\InvestmentHolding;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class InvestmentPerformanceQuery
{
    public function __construct(private CurrentInvestmentValueQuery $currentValueQuery) {}

    /** @return array{totalCurrentValue: int, totalAcquisitionCost: int, profitLoss: int, staleCount: int} */
    public function summary(User $user): array
    {
        $activeHoldings = InvestmentHolding::query()
            ->whereBelongsTo($user)
            ->where('status', InvestmentHoldingStatus::Active);

        $totalAcquisitionCost = (int) (clone $activeHoldings)->sum('acquisition_cost');
        $totalCurrentValue = $this->currentValueQuery->totalForActiveHoldings($user);
        $staleCount = (clone $activeHoldings)
            ->where(function (Builder $query): void {
                $query->whereNull('last_valuation_at')
                    ->orWhereDate('last_valuation_at', '<=', today()->subDays(30));
            })
            ->count();

        return [
            'totalCurrentValue' => $totalCurrentValue,
            'totalAcquisitionCost' => $totalAcquisitionCost,
            'profitLoss' => $totalCurrentValue - $totalAcquisitionCost,
            'staleCount' => $staleCount,
        ];
    }
}

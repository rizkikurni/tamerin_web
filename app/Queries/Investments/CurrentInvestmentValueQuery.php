<?php

namespace App\Queries\Investments;

use App\Enums\InvestmentHoldingStatus;
use App\Enums\InvestmentValuationStatus;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class CurrentInvestmentValueQuery
{
    /**
     * @param  Builder<InvestmentHolding>  $query
     * @return Builder<InvestmentHolding>
     */
    public function addCurrentValue(Builder $query): Builder
    {
        return $query->addSelect([
            'current_value' => InvestmentValuation::query()
                ->select('value')
                ->whereColumn('investment_holding_id', 'investment_holdings.id')
                ->where('status', InvestmentValuationStatus::Active)
                ->latest('valued_on')
                ->latest('created_at')
                ->limit(1),
        ]);
    }

    public function forHolding(InvestmentHolding $holding): ?int
    {
        $value = InvestmentValuation::query()
            ->whereBelongsTo($holding, 'investmentHolding')
            ->where('status', InvestmentValuationStatus::Active)
            ->latest('valued_on')
            ->latest('created_at')
            ->value('value');

        return $value === null ? null : (int) $value;
    }

    public function totalForActiveHoldings(User $user): int
    {
        $values = $this->addCurrentValue(
            InvestmentHolding::query()
                ->whereBelongsTo($user)
                ->where('status', InvestmentHoldingStatus::Active)
                ->select('id'),
        );

        return (int) DB::query()
            ->fromSub($values, 'investment_values')
            ->sum('current_value');
    }
}

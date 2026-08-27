<?php

namespace App\Queries\Investments;

use App\Enums\InvestmentValuationStatus;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use Illuminate\Pagination\LengthAwarePaginator;

class InvestmentHoldingDetailQuery
{
    public function __construct(private CurrentInvestmentValueQuery $currentValueQuery) {}

    /** @return array<string, mixed> */
    public function holding(InvestmentHolding $holding): array
    {
        $currentValue = $this->currentValueQuery->forHolding($holding);
        $profitLoss = $currentValue === null ? null : $currentValue - $holding->acquisition_cost;

        return [
            'id' => $holding->id,
            'name' => $holding->name,
            'instrument_type' => $holding->instrument_type->value,
            'acquisition_cost' => $holding->acquisition_cost,
            'acquired_on' => $holding->acquired_on->toDateString(),
            'units' => $holding->units,
            'status' => $holding->status->value,
            'last_valuation_at' => $holding->last_valuation_at?->toDateString(),
            'archived_at' => $holding->archived_at?->toISOString(),
            'current_value' => $currentValue,
            'profit_loss' => $profitLoss,
            'profit_loss_percentage' => $profitLoss === null || $holding->acquisition_cost === 0
                ? null
                : round(($profitLoss / $holding->acquisition_cost) * 100, 2),
        ];
    }

    /** @return LengthAwarePaginator<int, covariant array<string, mixed>> */
    public function valuations(InvestmentHolding $holding): LengthAwarePaginator
    {
        return InvestmentValuation::query()
            ->whereBelongsTo($holding, 'investmentHolding')
            ->where('user_id', $holding->user_id)
            ->latest('valued_on')
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (InvestmentValuation $valuation): array => [
                'id' => $valuation->id,
                'valued_on' => $valuation->valued_on->toDateString(),
                'value' => $valuation->value,
                'note' => $valuation->note,
                'status' => $valuation->status->value,
            ]);
    }

    /** @return list<array{valued_on: string, value: int}> */
    public function chart(InvestmentHolding $holding): array
    {
        $points = InvestmentValuation::query()
            ->whereBelongsTo($holding, 'investmentHolding')
            ->where('status', InvestmentValuationStatus::Active)
            ->latest('valued_on')
            ->limit(24)
            ->get(['valued_on', 'value'])
            ->sortBy('valued_on')
            ->map(fn (InvestmentValuation $valuation): array => [
                'valued_on' => $valuation->valued_on->toDateString(),
                'value' => $valuation->value,
            ])
            ->values()
            ->all();

        return array_values($points);
    }
}

<?php

namespace App\Queries\Investments;

use App\Models\InvestmentHolding;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class InvestmentHoldingIndexQuery
{
    public function __construct(private CurrentInvestmentValueQuery $currentValueQuery) {}

    /**
     * @param  array{instrument_type: string|null, status: string|null, valuation_condition: string|null}  $filters
     * @return LengthAwarePaginator<int, covariant array<string, mixed>>
     */
    public function paginate(User $user, array $filters): LengthAwarePaginator
    {
        $query = InvestmentHolding::query()
            ->whereBelongsTo($user)
            ->select([
                'id',
                'name',
                'instrument_type',
                'acquisition_cost',
                'acquired_on',
                'units',
                'status',
                'last_valuation_at',
                'archived_at',
                'created_at',
            ]);

        return $this->currentValueQuery
            ->addCurrentValue($query)
            ->when(
                $filters['instrument_type'],
                fn (Builder $builder, string $type): Builder => $builder->where('instrument_type', $type),
            )
            ->when(
                $filters['status'],
                fn (Builder $builder, string $status): Builder => $builder->where('status', $status),
            )
            ->when(
                $filters['valuation_condition'] === 'current',
                fn (Builder $builder): Builder => $builder->whereDate('last_valuation_at', '>', today()->subDays(30)),
            )
            ->when(
                $filters['valuation_condition'] === 'stale',
                fn (Builder $builder): Builder => $builder
                    ->whereNotNull('last_valuation_at')
                    ->whereDate('last_valuation_at', '<=', today()->subDays(30)),
            )
            ->when(
                $filters['valuation_condition'] === 'unvalued',
                fn (Builder $builder): Builder => $builder->whereNull('last_valuation_at'),
            )
            ->latest('created_at')
            ->paginate(12)
            ->withQueryString()
            ->through($this->toItem(...));
    }

    /** @return array<string, mixed> */
    private function toItem(InvestmentHolding $holding): array
    {
        $currentValue = $holding->getAttribute('current_value');
        $currentValue = $currentValue === null ? null : (int) $currentValue;
        $profitLoss = $currentValue === null ? null : $currentValue - $holding->acquisition_cost;
        $percentage = $profitLoss === null || $holding->acquisition_cost === 0
            ? null
            : round(($profitLoss / $holding->acquisition_cost) * 100, 2);

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
            'profit_loss_percentage' => $percentage,
        ];
    }
}

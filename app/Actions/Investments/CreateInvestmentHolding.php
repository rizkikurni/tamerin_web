<?php

namespace App\Actions\Investments;

use App\Enums\InvestmentHoldingStatus;
use App\Models\InvestmentHolding;
use App\Models\User;

class CreateInvestmentHolding
{
    /** @param array{name: string, instrument_type: string, acquisition_cost: int, acquired_on: string, units: string|null} $data */
    public function handle(User $user, array $data): InvestmentHolding
    {
        return $user->investmentHoldings()->create([
            ...$data,
            'status' => InvestmentHoldingStatus::Active,
            'last_valuation_at' => null,
            'archived_at' => null,
        ]);
    }
}

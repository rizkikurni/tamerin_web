<?php

namespace App\Actions\Investments;

use App\Models\InvestmentHolding;

class UpdateInvestmentHolding
{
    /** @param array{name: string, instrument_type: string, acquisition_cost: int, acquired_on: string, units: string|null} $data */
    public function handle(InvestmentHolding $holding, array $data): InvestmentHolding
    {
        $holding->update($data);

        return $holding->refresh();
    }
}

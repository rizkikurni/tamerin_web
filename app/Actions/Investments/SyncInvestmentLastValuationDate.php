<?php

namespace App\Actions\Investments;

use App\Enums\InvestmentValuationStatus;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;

class SyncInvestmentLastValuationDate
{
    public function handle(InvestmentHolding $holding): InvestmentHolding
    {
        $latestDate = InvestmentValuation::query()
            ->whereBelongsTo($holding, 'investmentHolding')
            ->where('status', InvestmentValuationStatus::Active)
            ->max('valued_on');

        $holding->update(['last_valuation_at' => $latestDate]);

        return $holding->refresh();
    }
}

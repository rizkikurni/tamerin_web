<?php

namespace App\Actions\Investments;

use App\Enums\InvestmentValuationStatus;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VoidInvestmentValuation
{
    public function __construct(private SyncInvestmentLastValuationDate $syncLastValuationDate) {}

    public function handle(InvestmentValuation $valuation): InvestmentValuation
    {
        return DB::transaction(function () use ($valuation): InvestmentValuation {
            $lockedHolding = InvestmentHolding::query()
                ->whereKey($valuation->investment_holding_id)
                ->lockForUpdate()
                ->firstOrFail();
            $lockedValuation = InvestmentValuation::query()
                ->whereKey($valuation->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedValuation->status === InvestmentValuationStatus::Voided) {
                throw ValidationException::withMessages([
                    'valuation' => 'Valuasi ini sudah dibatalkan.',
                ]);
            }

            $lockedValuation->update(['status' => InvestmentValuationStatus::Voided]);
            $this->syncLastValuationDate->handle($lockedHolding);

            return $lockedValuation->refresh();
        });
    }
}

<?php

namespace App\Actions\Investments;

use App\Enums\InvestmentHoldingStatus;
use App\Models\InvestmentHolding;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ArchiveInvestmentHolding
{
    public function handle(InvestmentHolding $holding): InvestmentHolding
    {
        return DB::transaction(function () use ($holding): InvestmentHolding {
            $lockedHolding = InvestmentHolding::query()
                ->whereKey($holding->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedHolding->status === InvestmentHoldingStatus::Archived) {
                throw ValidationException::withMessages([
                    'investment' => 'Investasi ini sudah diarsipkan.',
                ]);
            }

            $lockedHolding->update([
                'status' => InvestmentHoldingStatus::Archived,
                'archived_at' => now(),
            ]);

            return $lockedHolding->refresh();
        });
    }
}

<?php

namespace App\Actions\SavingsGoals;

use App\Enums\SavingsContributionStatus;
use App\Models\SavingsContribution;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VoidSavingsContribution
{
    public function handle(SavingsContribution $contribution, string $reason): SavingsContribution
    {
        return DB::transaction(function () use ($contribution, $reason): SavingsContribution {
            $lockedContribution = SavingsContribution::query()
                ->whereKey($contribution->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedContribution->status === SavingsContributionStatus::Voided) {
                throw ValidationException::withMessages([
                    'void_reason' => 'Setoran ini sudah dibatalkan.',
                ]);
            }

            $lockedContribution->update([
                'status' => SavingsContributionStatus::Voided,
                'voided_at' => now(),
                'void_reason' => $reason,
            ]);

            return $lockedContribution->refresh();
        });
    }
}

<?php

namespace App\Actions\SavingsGoals;

use App\Enums\SavingsGoalStatus;
use App\Models\SavingsGoal;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ArchiveSavingsGoal
{
    public function handle(SavingsGoal $goal): SavingsGoal
    {
        return DB::transaction(function () use ($goal): SavingsGoal {
            $lockedGoal = SavingsGoal::query()
                ->whereKey($goal->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedGoal->status === SavingsGoalStatus::Archived) {
                throw ValidationException::withMessages([
                    'goal' => 'Target ini sudah diarsipkan.',
                ]);
            }

            $lockedGoal->update([
                'status' => SavingsGoalStatus::Archived,
                'archived_at' => now(),
            ]);

            return $lockedGoal->refresh();
        });
    }
}

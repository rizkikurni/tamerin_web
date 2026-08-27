<?php

namespace App\Actions\SavingsGoals;

use App\Enums\SavingsContributionStatus;
use App\Enums\SavingsGoalStatus;
use App\Models\SavingsGoal;

class CompleteSavingsGoal
{
    public function handle(SavingsGoal $goal): SavingsGoal
    {
        if ($goal->status !== SavingsGoalStatus::Active) {
            return $goal;
        }

        $savedAmount = (int) $goal->contributions()
            ->where('status', SavingsContributionStatus::Active)
            ->sum('amount');

        if ($savedAmount >= $goal->target_amount) {
            $goal->update([
                'status' => SavingsGoalStatus::Completed,
                'completed_at' => now(),
            ]);
        }

        return $goal->refresh();
    }
}

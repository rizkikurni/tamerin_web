<?php

namespace App\Actions\SavingsGoals;

use App\Enums\SavingsGoalStatus;
use App\Models\SavingsGoal;
use App\Models\User;

class CreateSavingsGoal
{
    /** @param array{name: string, target_amount: int, target_date: string|null} $data */
    public function handle(User $user, array $data): SavingsGoal
    {
        return $user->savingsGoals()->create([
            ...$data,
            'status' => SavingsGoalStatus::Active,
            'completed_at' => null,
            'archived_at' => null,
        ]);
    }
}

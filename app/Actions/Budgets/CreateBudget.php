<?php

namespace App\Actions\Budgets;

use App\Models\Budget;
use App\Models\User;

class CreateBudget
{
    /** @param array{category_id: string, period_start: string, amount: int} $data */
    public function handle(User $user, array $data): Budget
    {
        return $user->budgets()->create($data);
    }
}

<?php

namespace App\Actions\Budgets;

use App\Models\Budget;

class UpdateBudget
{
    /** @param array{amount: int} $data */
    public function handle(Budget $budget, array $data): Budget
    {
        $budget->update($data);

        return $budget->refresh();
    }
}

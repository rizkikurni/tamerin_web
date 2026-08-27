<?php

namespace App\Http\Controllers;

use App\Actions\SavingsGoals\ArchiveSavingsGoal;
use App\Models\SavingsGoal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class ArchiveSavingsGoalController extends Controller
{
    public function __invoke(
        SavingsGoal $savingsGoal,
        ArchiveSavingsGoal $action,
    ): RedirectResponse {
        Gate::authorize('archive', $savingsGoal);
        $action->handle($savingsGoal);

        return to_route('savings-goals.index')
            ->with('status', 'savings-goal-archived');
    }
}

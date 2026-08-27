<?php

namespace App\Http\Controllers;

use App\Actions\SavingsGoals\RecordSavingsContribution;
use App\Http\Requests\StoreSavingsContributionRequest;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class SavingsContributionController extends Controller
{
    public function store(
        StoreSavingsContributionRequest $request,
        SavingsGoal $savingsGoal,
        RecordSavingsContribution $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $action->handle($user, $savingsGoal, $request->contributionData());

        return to_route('savings-goals.show', $savingsGoal)
            ->with('status', 'savings-contribution-recorded');
    }
}

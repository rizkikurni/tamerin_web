<?php

namespace App\Http\Controllers;

use App\Actions\SavingsGoals\VoidSavingsContribution;
use App\Http\Requests\VoidSavingsContributionRequest;
use App\Models\SavingsContribution;
use Illuminate\Http\RedirectResponse;

class VoidSavingsContributionController extends Controller
{
    public function __invoke(
        VoidSavingsContributionRequest $request,
        SavingsContribution $savingsContribution,
        VoidSavingsContribution $action,
    ): RedirectResponse {
        $action->handle($savingsContribution, $request->voidReason());

        return to_route('savings-goals.show', $savingsContribution->savings_goal_id)
            ->with('status', 'savings-contribution-voided');
    }
}

<?php

namespace App\Http\Controllers;

use App\Actions\Investments\RecordInvestmentValuation;
use App\Http\Requests\StoreInvestmentValuationRequest;
use App\Models\InvestmentHolding;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class InvestmentValuationController extends Controller
{
    public function store(
        StoreInvestmentValuationRequest $request,
        InvestmentHolding $investment,
        RecordInvestmentValuation $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $action->handle($user, $investment, $request->valuationData(), $request->requestId());

        return to_route('investments.show', $investment)
            ->with('status', 'investment-valuation-recorded');
    }
}

<?php

namespace App\Http\Controllers;

use App\Actions\Investments\VoidInvestmentValuation;
use App\Models\InvestmentValuation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class VoidInvestmentValuationController extends Controller
{
    public function __invoke(
        InvestmentValuation $investmentValuation,
        VoidInvestmentValuation $action,
    ): RedirectResponse {
        Gate::authorize('void', $investmentValuation);
        $action->handle($investmentValuation);

        return to_route('investments.show', $investmentValuation->investment_holding_id)
            ->with('status', 'investment-valuation-voided');
    }
}

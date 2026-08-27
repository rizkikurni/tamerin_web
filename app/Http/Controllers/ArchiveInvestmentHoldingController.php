<?php

namespace App\Http\Controllers;

use App\Actions\Investments\ArchiveInvestmentHolding;
use App\Models\InvestmentHolding;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class ArchiveInvestmentHoldingController extends Controller
{
    public function __invoke(
        InvestmentHolding $investment,
        ArchiveInvestmentHolding $action,
    ): RedirectResponse {
        Gate::authorize('archive', $investment);
        $action->handle($investment);

        return to_route('investments.index')
            ->with('status', 'investment-archived');
    }
}

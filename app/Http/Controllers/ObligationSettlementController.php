<?php

namespace App\Http\Controllers;

use App\Actions\Obligations\SettleObligation;
use App\Http\Requests\StoreObligationSettlementRequest;
use App\Models\Obligation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class ObligationSettlementController extends Controller
{
    public function store(
        StoreObligationSettlementRequest $request,
        Obligation $obligation,
        SettleObligation $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $settlement = $action->handle(
            $user,
            $obligation,
            $request->settlementData(),
            $request->requestId(),
        );

        return to_route('obligations.show', $settlement->obligation_id)
            ->with('status', 'obligation-settlement-recorded');
    }
}

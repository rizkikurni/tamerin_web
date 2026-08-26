<?php

namespace App\Http\Controllers;

use App\Actions\Transactions\VoidTransaction;
use App\Http\Requests\VoidTransactionRequest;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class VoidTransactionController extends Controller
{
    public function __invoke(
        VoidTransactionRequest $request,
        Transaction $transaction,
        VoidTransaction $action,
    ): RedirectResponse {
        /** @var User $actor */
        $actor = $request->user();

        $action->handle(
            transaction: $transaction,
            actor: $actor,
            reason: $request->voidReason(),
            requestId: $request->requestId(),
        );

        return to_route('transactions.show', $transaction)
            ->with('status', 'transaction-voided');
    }
}

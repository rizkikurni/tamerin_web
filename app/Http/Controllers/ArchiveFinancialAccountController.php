<?php

namespace App\Http\Controllers;

use App\Actions\FinancialAccounts\ArchiveFinancialAccount;
use App\Models\FinancialAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class ArchiveFinancialAccountController extends Controller
{
    public function __invoke(
        FinancialAccount $financialAccount,
        ArchiveFinancialAccount $action,
    ): RedirectResponse {
        Gate::authorize('archive', $financialAccount);
        $action->handle($financialAccount);

        return to_route('financial-accounts.index')->with('status', 'financial-account-archived');
    }
}

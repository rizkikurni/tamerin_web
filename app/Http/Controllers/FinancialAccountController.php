<?php

namespace App\Http\Controllers;

use App\Actions\FinancialAccounts\CreateFinancialAccount;
use App\Actions\FinancialAccounts\UpdateFinancialAccount;
use App\Enums\FinancialAccountType;
use App\Http\Requests\StoreFinancialAccountRequest;
use App\Http\Requests\UpdateFinancialAccountRequest;
use App\Models\FinancialAccount;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class FinancialAccountController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', FinancialAccount::class);

        /** @var User $user */
        $user = $request->user();

        $accounts = $user->financialAccounts()
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (FinancialAccount $account): array => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type->value,
                'opening_balance' => $account->opening_balance,
                'opened_on' => $account->opened_on->toDateString(),
                'status' => $account->status->value,
                'archived_at' => $account->archived_at?->toISOString(),
            ]);

        return Inertia::render('financial-accounts/index', ['accounts' => $accounts]);
    }

    public function create(): Response
    {
        Gate::authorize('create', FinancialAccount::class);

        return Inertia::render('financial-accounts/create', [
            'accountTypes' => $this->accountTypes(),
        ]);
    }

    public function store(
        StoreFinancialAccountRequest $request,
        CreateFinancialAccount $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $action->handle($user, $request->accountData());

        return to_route('financial-accounts.index')->with('status', 'financial-account-created');
    }

    public function edit(FinancialAccount $financialAccount): Response
    {
        Gate::authorize('update', $financialAccount);

        return Inertia::render('financial-accounts/edit', [
            'account' => [
                'id' => $financialAccount->id,
                'name' => $financialAccount->name,
                'type' => $financialAccount->type->value,
                'opening_balance' => $financialAccount->opening_balance,
                'opened_on' => $financialAccount->opened_on->toDateString(),
            ],
            'accountTypes' => $this->accountTypes(),
        ]);
    }

    public function update(
        UpdateFinancialAccountRequest $request,
        FinancialAccount $financialAccount,
        UpdateFinancialAccount $action,
    ): RedirectResponse {
        $action->handle($financialAccount, $request->accountData());

        return to_route('financial-accounts.index')->with('status', 'financial-account-updated');
    }

    /** @return list<array{value: string, label: string}> */
    private function accountTypes(): array
    {
        return [
            ['value' => FinancialAccountType::Cash->value, 'label' => 'Tunai'],
            ['value' => FinancialAccountType::Bank->value, 'label' => 'Bank'],
            ['value' => FinancialAccountType::EWallet->value, 'label' => 'Dompet digital'],
        ];
    }
}

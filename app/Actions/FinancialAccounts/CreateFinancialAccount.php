<?php

namespace App\Actions\FinancialAccounts;

use App\Enums\FinancialAccountStatus;
use App\Models\FinancialAccount;
use App\Models\User;

class CreateFinancialAccount
{
    /** @param array{name: string, type: string, opening_balance: int, opened_on: string} $data */
    public function handle(User $user, array $data): FinancialAccount
    {
        return $user->financialAccounts()->create([
            ...$data,
            'status' => FinancialAccountStatus::Active,
            'archived_at' => null,
        ]);
    }
}

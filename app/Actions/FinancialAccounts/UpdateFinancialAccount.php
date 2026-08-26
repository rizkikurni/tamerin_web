<?php

namespace App\Actions\FinancialAccounts;

use App\Models\FinancialAccount;

class UpdateFinancialAccount
{
    /** @param array{name: string, type: string, opening_balance: int, opened_on: string} $data */
    public function handle(FinancialAccount $financialAccount, array $data): FinancialAccount
    {
        $financialAccount->update($data);

        return $financialAccount->refresh();
    }
}

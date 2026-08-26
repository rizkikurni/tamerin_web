<?php

namespace App\Actions\FinancialAccounts;

use App\Enums\FinancialAccountStatus;
use App\Models\FinancialAccount;
use DomainException;

class ArchiveFinancialAccount
{
    public function handle(FinancialAccount $financialAccount): FinancialAccount
    {
        if ($financialAccount->status === FinancialAccountStatus::Archived || $financialAccount->archived_at !== null) {
            throw new DomainException('Akun keuangan sudah diarsipkan.');
        }

        $financialAccount->update([
            'status' => FinancialAccountStatus::Archived,
            'archived_at' => now(),
        ]);

        return $financialAccount->refresh();
    }
}

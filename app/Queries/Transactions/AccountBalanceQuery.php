<?php

namespace App\Queries\Transactions;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\FinancialAccount;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Builder;

class AccountBalanceQuery
{
    public function calculate(FinancialAccount $account): int
    {
        $balanceChange = Transaction::query()
            ->where('status', TransactionStatus::Posted)
            ->where(function (Builder $query) use ($account): void {
                $query->where('account_id', $account->id)
                    ->orWhere('destination_account_id', $account->id);
            })
            ->selectRaw(
                <<<'SQL'
                    COALESCE(SUM(CASE
                        WHEN type = ? AND account_id = ? THEN amount
                        WHEN type = ? AND account_id = ? THEN -amount
                        WHEN type = ? AND account_id = ? THEN -amount
                        WHEN type = ? AND destination_account_id = ? THEN amount
                        ELSE 0
                    END), 0) AS balance_change
                    SQL,
                [
                    TransactionType::Income->value,
                    $account->id,
                    TransactionType::Expense->value,
                    $account->id,
                    TransactionType::Transfer->value,
                    $account->id,
                    TransactionType::Transfer->value,
                    $account->id,
                ],
            )
            ->value('balance_change');

        return $account->opening_balance + (int) $balanceChange;
    }
}

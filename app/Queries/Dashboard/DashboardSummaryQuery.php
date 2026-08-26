<?php

namespace App\Queries\Dashboard;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\FinancialAccount;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardSummaryQuery
{
    /**
     * @return array{
     *     summary: array{
     *         totalBalance: int,
     *         activeAccountCount: int,
     *         income: int,
     *         expense: int,
     *         netCashFlow: int,
     *         incomeComparison: float|null,
     *         expenseComparison: float|null
     *     },
     *     cashFlow: list<array{date: string, income: int, expense: int}>,
     *     accounts: list<array{id: string, name: string, type: string, balance: int, contribution: float}>
     * }
     */
    public function handle(User $user, Carbon $period): array
    {
        $accounts = $this->activeAccountBalances($user);
        $cashFlow = $this->cashFlow($user, $period);
        $income = (int) collect($cashFlow)->sum('income');
        $expense = (int) collect($cashFlow)->sum('expense');
        $previousTotals = $this->periodTotals($user, $period->copy()->subMonth());
        $totalBalance = (int) $accounts->sum('balance');
        $positiveBalance = (int) $accounts->sum(
            fn (array $account): int => max($account['balance'], 0),
        );

        return [
            'summary' => [
                'totalBalance' => $totalBalance,
                'activeAccountCount' => $accounts->count(),
                'income' => $income,
                'expense' => $expense,
                'netCashFlow' => $income - $expense,
                'incomeComparison' => $this->percentageChange($income, $previousTotals['income']),
                'expenseComparison' => $this->percentageChange($expense, $previousTotals['expense']),
            ],
            'cashFlow' => $cashFlow,
            'accounts' => array_values($accounts
                ->sortByDesc('balance')
                ->take(5)
                ->map(function (array $account) use ($positiveBalance): array {
                    $account['contribution'] = $positiveBalance > 0
                        ? round((max($account['balance'], 0) / $positiveBalance) * 100, 1)
                        : 0.0;

                    return $account;
                })
                ->values()
                ->all()),
        ];
    }

    /**
     * @return Collection<int, array{id: string, name: string, type: 'cash'|'bank'|'e_wallet', balance: int}>
     */
    private function activeAccountBalances(User $user): Collection
    {
        $accountIdColumn = 'financial_accounts.id';
        $balanceChange = Transaction::query()
            ->whereBelongsTo($user)
            ->where('status', TransactionStatus::Posted)
            ->whereDate('transacted_on', '<=', today())
            ->where(function (Builder $query) use ($accountIdColumn): void {
                $query->whereColumn('account_id', $accountIdColumn)
                    ->orWhereColumn('destination_account_id', $accountIdColumn);
            })
            ->selectRaw(
                "COALESCE(SUM(CASE
                    WHEN type = ? AND account_id = {$accountIdColumn} THEN amount
                    WHEN type = ? AND account_id = {$accountIdColumn} THEN -amount
                    WHEN type = ? AND account_id = {$accountIdColumn} THEN -amount
                    WHEN type = ? AND destination_account_id = {$accountIdColumn} THEN amount
                    ELSE 0
                END), 0)",
                [
                    TransactionType::Income->value,
                    TransactionType::Expense->value,
                    TransactionType::Transfer->value,
                    TransactionType::Transfer->value,
                ],
            );

        return FinancialAccount::query()
            ->whereBelongsTo($user)
            ->active()
            ->whereDate('opened_on', '<=', today())
            ->select(['id', 'name', 'type', 'opening_balance'])
            ->addSelect(['balance_change' => $balanceChange])
            ->get()
            ->map(fn (FinancialAccount $account): array => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type->value,
                'balance' => $account->opening_balance + (int) $account->getAttribute('balance_change'),
            ]);
    }

    /** @return list<array{date: string, income: int, expense: int}> */
    private function cashFlow(User $user, Carbon $period): array
    {
        $dailyTotals = Transaction::query()
            ->whereBelongsTo($user)
            ->where('status', TransactionStatus::Posted)
            ->whereIn('type', [TransactionType::Income, TransactionType::Expense])
            ->whereBetween('transacted_on', [
                $period->copy()->startOfMonth()->toDateString(),
                $period->copy()->endOfMonth()->toDateString(),
            ])
            ->select('transacted_on')
            ->selectRaw(
                'SUM(CASE WHEN type = ? THEN amount ELSE 0 END) AS income',
                [TransactionType::Income->value],
            )
            ->selectRaw(
                'SUM(CASE WHEN type = ? THEN amount ELSE 0 END) AS expense',
                [TransactionType::Expense->value],
            )
            ->groupBy('transacted_on')
            ->get()
            ->mapWithKeys(fn (Transaction $transaction): array => [
                $transaction->transacted_on->toDateString() => [
                    'income' => (int) $transaction->getAttribute('income'),
                    'expense' => (int) $transaction->getAttribute('expense'),
                ],
            ]);

        $cashFlow = [];

        for ($day = 0; $day < $period->daysInMonth; $day++) {
            $date = $period->copy()->startOfMonth()->addDays($day)->toDateString();
            $totals = $dailyTotals->get($date, ['income' => 0, 'expense' => 0]);

            $cashFlow[] = [
                'date' => $date,
                'income' => $totals['income'],
                'expense' => $totals['expense'],
            ];
        }

        return $cashFlow;
    }

    /** @return array{income: int, expense: int} */
    private function periodTotals(User $user, Carbon $period): array
    {
        $totals = Transaction::query()
            ->whereBelongsTo($user)
            ->where('status', TransactionStatus::Posted)
            ->whereBetween('transacted_on', [
                $period->copy()->startOfMonth()->toDateString(),
                $period->copy()->endOfMonth()->toDateString(),
            ])
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS income',
                [TransactionType::Income->value],
            )
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) AS expense',
                [TransactionType::Expense->value],
            )
            ->toBase()
            ->first();

        return [
            'income' => (int) data_get($totals, 'income', 0),
            'expense' => (int) data_get($totals, 'expense', 0),
        ];
    }

    private function percentageChange(int $current, int $previous): ?float
    {
        if ($previous === 0) {
            return null;
        }

        return round((($current - $previous) / abs($previous)) * 100, 1);
    }
}

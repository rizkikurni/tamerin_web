<?php

namespace App\Queries\Dashboard;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Budget;
use App\Models\Transaction;
use App\Models\User;
use Carbon\CarbonInterface;

class BudgetUsageQuery
{
    /**
     * @return list<array{
     *     id: string,
     *     category: string,
     *     spent: int,
     *     limit: int,
     *     remaining: int,
     *     percentage: float,
     *     status: 'safe'|'warning'|'reached'|'over'
     * }>
     */
    public function get(User $user, CarbonInterface $period, int $limit = 5): array
    {
        $usageByCategory = Transaction::query()
            ->whereBelongsTo($user)
            ->where('status', TransactionStatus::Posted)
            ->where('type', TransactionType::Expense)
            ->whereBetween('transacted_on', [
                $period->copy()->startOfMonth()->toDateString(),
                $period->copy()->endOfMonth()->toDateString(),
            ])
            ->whereNotNull('category_id')
            ->select('category_id')
            ->selectRaw('SUM(amount) AS total')
            ->groupBy('category_id')
            ->pluck('total', 'category_id');

        $budgetModels = Budget::query()
            ->whereBelongsTo($user)
            ->whereDate('period_start', $period->toDateString())
            ->select(['id', 'category_id', 'amount'])
            ->with('category:id,name')
            ->get();
        $sortableBudgets = [];

        foreach ($budgetModels as $budget) {
            $spent = (int) $usageByCategory->get($budget->category_id, 0);
            $amount = (int) $budget->amount;
            $percentage = round(($spent / $amount) * 100, 1);
            $status = $this->status($percentage);

            $sortableBudgets[] = [
                'id' => $budget->id,
                'category' => $budget->category->name,
                'spent' => $spent,
                'limit' => $amount,
                'remaining' => $amount - $spent,
                'percentage' => $percentage,
                'priority' => match ($status) {
                    'over' => 3,
                    'reached', 'warning' => 2,
                    default => 1,
                },
            ];
        }

        usort($sortableBudgets, fn (array $left, array $right): int => [
            $right['priority'],
            $right['percentage'],
        ] <=> [
            $left['priority'],
            $left['percentage'],
        ]);
        $budgets = [];

        foreach (array_slice($sortableBudgets, 0, $limit) as $budget) {
            $budgets[] = [
                'id' => $budget['id'],
                'category' => $budget['category'],
                'spent' => $budget['spent'],
                'limit' => $budget['limit'],
                'remaining' => $budget['remaining'],
                'percentage' => $budget['percentage'],
                'status' => $this->status($budget['percentage']),
            ];
        }

        return $budgets;
    }

    /** @return 'safe'|'warning'|'reached'|'over' */
    private function status(float $percentage): string
    {
        return match (true) {
            $percentage > 100 => 'over',
            $percentage === 100.0 => 'reached',
            $percentage >= 80 => 'warning',
            default => 'safe',
        };
    }
}

<?php

namespace App\Queries\Budgets;

use App\Enums\BudgetUsageStatus;
use App\Enums\CategoryType;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * @phpstan-type DashboardBudget array{
 *     id: string,
 *     category: string,
 *     spent: int,
 *     limit: int,
 *     remaining: int,
 *     percentage: float,
 *     status: BudgetUsageStatus
 * }
 * @phpstan-type BudgetListItem array{
 *     id: string,
 *     category: array{id: string, name: string, color_token: string|null, icon: string|null},
 *     period_start: string,
 *     amount: int,
 *     spent: int,
 *     remaining: int,
 *     percentage: float,
 *     status: BudgetUsageStatus
 * }
 */
class BudgetUsageQuery
{
    /** @return list<DashboardBudget> */
    public function get(User $user, CarbonInterface $period, int $limit = 5): array
    {
        return array_slice($this->all($user, $period), 0, $limit);
    }

    /** @return LengthAwarePaginator<int, covariant BudgetListItem> */
    public function paginate(User $user, CarbonInterface $period, int $perPage = 12): LengthAwarePaginator
    {
        $usageByCategory = $this->usageByCategory($user, $period);

        return Budget::query()
            ->whereBelongsTo($user)
            ->whereDate('period_start', $period->copy()->startOfMonth()->toDateString())
            ->select(['id', 'category_id', 'period_start', 'amount', 'created_at'])
            ->with('category:id,name,color_token,icon')
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(
                /** @return BudgetListItem */
                fn (Budget $budget): array => $this->listItem($budget, $usageByCategory),
            );
    }

    /** @return list<BudgetListItem> */
    public function reportItems(User $user, CarbonInterface $period, ?string $categoryId = null): array
    {
        $usageByCategory = $this->usageByCategory($user, $period);
        $items = Budget::query()
            ->whereBelongsTo($user)
            ->whereDate('period_start', $period->copy()->startOfMonth()->toDateString())
            ->when(
                $categoryId,
                fn ($query, string $value) => $query->where('category_id', $value),
            )
            ->select(['id', 'category_id', 'period_start', 'amount', 'created_at'])
            ->with('category:id,name,color_token,icon')
            ->latest()
            ->get()
            ->map(
                /** @return BudgetListItem */
                fn (Budget $budget): array => $this->listItem($budget, $usageByCategory),
            )
            ->values()
            ->all();

        return array_values($items);
    }

    /** @return array{allocated: int, spent: int, remaining: int, percentage: float, overBudgetCount: int} */
    public function summary(User $user, CarbonInterface $period): array
    {
        $budgets = $this->all($user, $period);
        $allocated = (int) collect($budgets)->sum('limit');
        $spent = (int) collect($budgets)->sum('spent');

        return [
            'allocated' => $allocated,
            'spent' => $spent,
            'remaining' => $allocated - $spent,
            'percentage' => $allocated > 0
                ? round(($spent / $allocated) * 100, 1)
                : 0.0,
            'overBudgetCount' => collect($budgets)
                ->where('status', BudgetUsageStatus::Over)
                ->count(),
        ];
    }

    /** @return list<array{value: string, label: string}> */
    public function availableCategoryOptions(User $user, CarbonInterface $period): array
    {
        $budgetedCategoryIds = Budget::query()
            ->whereBelongsTo($user)
            ->whereDate('period_start', $period->copy()->startOfMonth()->toDateString())
            ->select('category_id');

        $options = Category::query()
            ->whereBelongsTo($user)
            ->active()
            ->where('type', CategoryType::Expense)
            ->whereNotIn('id', $budgetedCategoryIds)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $category): array => [
                'value' => $category->id,
                'label' => $category->name,
            ])
            ->values()
            ->all();

        return array_values($options);
    }

    /** @return list<DashboardBudget> */
    private function all(User $user, CarbonInterface $period): array
    {
        $usageByCategory = $this->usageByCategory($user, $period);
        $budgets = Budget::query()
            ->whereBelongsTo($user)
            ->whereDate('period_start', $period->copy()->startOfMonth()->toDateString())
            ->select(['id', 'category_id', 'amount'])
            ->with('category:id,name')
            ->get()
            ->map(fn (Budget $budget): array => $this->dashboardItem($budget, $usageByCategory))
            ->sortByDesc(fn (array $budget): array => [
                $budget['status']->priority(),
                $budget['percentage'],
            ])
            ->values()
            ->all();

        return array_values($budgets);
    }

    /** @return Collection<string, int> */
    private function usageByCategory(User $user, CarbonInterface $period): Collection
    {
        return Transaction::query()
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
            ->pluck('total', 'category_id')
            ->map(fn (mixed $amount): int => (int) $amount);
    }

    /** @param Collection<string, int> $usageByCategory
     * @return DashboardBudget
     */
    private function dashboardItem(Budget $budget, Collection $usageByCategory): array
    {
        $spent = $usageByCategory->get($budget->category_id, 0);
        $percentage = ($spent / $budget->amount) * 100;

        return [
            'id' => $budget->id,
            'category' => $budget->category->name,
            'spent' => $spent,
            'limit' => $budget->amount,
            'remaining' => $budget->amount - $spent,
            'percentage' => round($percentage, 1),
            'status' => BudgetUsageStatus::fromPercentage($percentage),
        ];
    }

    /**
     * @param  Collection<string, int>  $usageByCategory
     * @return BudgetListItem
     */
    private function listItem(Budget $budget, Collection $usageByCategory): array
    {
        $spent = $usageByCategory->get($budget->category_id, 0);
        $percentage = ($spent / $budget->amount) * 100;

        return [
            'id' => $budget->id,
            'category' => [
                'id' => $budget->category->id,
                'name' => $budget->category->name,
                'color_token' => $budget->category->color_token,
                'icon' => $budget->category->icon,
            ],
            'period_start' => $budget->period_start->toDateString(),
            'amount' => $budget->amount,
            'spent' => $spent,
            'remaining' => $budget->amount - $spent,
            'percentage' => round($percentage, 1),
            'status' => BudgetUsageStatus::fromPercentage($percentage),
        ];
    }
}

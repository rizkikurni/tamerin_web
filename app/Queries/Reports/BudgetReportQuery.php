<?php

namespace App\Queries\Reports;

use App\Models\User;
use App\Queries\Budgets\BudgetUsageQuery;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

class BudgetReportQuery
{
    public function __construct(private BudgetUsageQuery $budgetUsageQuery) {}

    /** @param array{report_type: string, date_from: string, date_to: string, account_id: string|null, category_id: string|null, status: string|null} $filters
     * @return array<string, mixed>
     */
    public function get(User $user, array $filters, int $perPage = 15): array
    {
        $period = Carbon::parse($filters['date_from'])->startOfMonth();
        $items = collect($this->budgetUsageQuery->reportItems($user, $period, $filters['category_id']))
            ->filter(
                fn (array $row): bool => $filters['status'] === null
                    || $row['status']->value === $filters['status'],
            )
            ->map(function (array $row): array {
                $row['status'] = $row['status']->value;

                return $row;
            })
            ->values();
        $allocated = (int) $items->sum('amount');
        $spent = (int) $items->sum('spent');
        $currentPage = LengthAwarePaginator::resolveCurrentPage();
        $details = new LengthAwarePaginator(
            $items->forPage($currentPage, $perPage)->values(),
            $items->count(),
            $perPage,
            $currentPage,
            ['path' => request()->url(), 'query' => request()->query()],
        );

        return [
            'type' => 'budgets',
            'title' => 'Laporan Budget',
            'summary' => [
                'allocated' => $allocated,
                'spent' => $spent,
                'remaining' => $allocated - $spent,
                'over_budget_count' => $items->where('status', 'over')->count(),
            ],
            'columns' => [
                ['key' => 'category.name', 'label' => 'Kategori', 'format' => 'text'],
                ['key' => 'amount', 'label' => 'Budget', 'format' => 'currency'],
                ['key' => 'spent', 'label' => 'Terpakai', 'format' => 'currency'],
                ['key' => 'remaining', 'label' => 'Sisa', 'format' => 'currency'],
                ['key' => 'percentage', 'label' => 'Progres', 'format' => 'percentage'],
                ['key' => 'status', 'label' => 'Status', 'format' => 'status'],
            ],
            'details' => $details,
            'chart' => [],
        ];
    }
}

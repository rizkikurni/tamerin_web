<?php

namespace App\Queries\Reports;

use App\Enums\SavingsGoalStatus;
use App\Models\User;
use App\Queries\SavingsGoals\SavingsGoalIndexQuery;

class SavingsReportQuery
{
    public function __construct(private SavingsGoalIndexQuery $savingsGoalIndexQuery) {}

    /** @param array{report_type: string, date_from: string, date_to: string, account_id: string|null, category_id: string|null, status: string|null} $filters
     * @return array<string, mixed>
     */
    public function get(User $user, array $filters, int $perPage = 15): array
    {
        $status = in_array($filters['status'], array_column(SavingsGoalStatus::cases(), 'value'), true)
            ? $filters['status']
            : null;
        $summary = $this->savingsGoalIndexQuery->summary($user);
        $details = $this->savingsGoalIndexQuery
            ->paginate($user, ['status' => $status], $perPage)
            ->through(function (array $row): array {
                $row['status'] = $row['status']->value;

                return $row;
            });

        return [
            'type' => 'savings',
            'title' => 'Laporan Target Tabungan',
            'summary' => [
                'total_target' => $summary['totalTarget'],
                'total_saved' => $summary['totalSaved'],
                'remaining' => max($summary['totalTarget'] - $summary['totalSaved'], 0),
                'completed_count' => $summary['completedCount'],
            ],
            'columns' => [
                ['key' => 'name', 'label' => 'Target', 'format' => 'text'],
                ['key' => 'target_amount', 'label' => 'Target', 'format' => 'currency'],
                ['key' => 'saved_amount', 'label' => 'Terkumpul', 'format' => 'currency'],
                ['key' => 'remaining_amount', 'label' => 'Sisa', 'format' => 'currency'],
                ['key' => 'percentage', 'label' => 'Progres', 'format' => 'percentage'],
                ['key' => 'status', 'label' => 'Status', 'format' => 'status'],
            ],
            'details' => $details,
            'chart' => [],
        ];
    }
}

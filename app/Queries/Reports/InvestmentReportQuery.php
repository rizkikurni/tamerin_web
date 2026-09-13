<?php

namespace App\Queries\Reports;

use App\Enums\InvestmentHoldingStatus;
use App\Models\User;
use App\Queries\Investments\InvestmentHoldingIndexQuery;
use App\Queries\Investments\InvestmentPerformanceQuery;

class InvestmentReportQuery
{
    public function __construct(
        private InvestmentHoldingIndexQuery $investmentHoldingIndexQuery,
        private InvestmentPerformanceQuery $investmentPerformanceQuery,
    ) {}

    /** @param array{report_type: string, date_from: string, date_to: string, account_id: string|null, category_id: string|null, status: string|null} $filters
     * @return array<string, mixed>
     */
    public function get(User $user, array $filters, int $perPage = 15): array
    {
        $status = in_array($filters['status'], array_column(InvestmentHoldingStatus::cases(), 'value'), true)
            ? $filters['status']
            : null;
        $summary = $this->investmentPerformanceQuery->summary($user);
        $details = $this->investmentHoldingIndexQuery->paginate(
            $user,
            [
                'instrument_type' => null,
                'status' => $status,
                'valuation_condition' => null,
            ],
            $perPage,
        );

        return [
            'type' => 'investments',
            'title' => 'Laporan Investasi',
            'summary' => [
                'acquisition_cost' => $summary['totalAcquisitionCost'],
                'current_value' => $summary['totalCurrentValue'],
                'profit_loss' => $summary['profitLoss'],
                'stale_count' => $summary['staleCount'],
            ],
            'columns' => [
                ['key' => 'name', 'label' => 'Investasi', 'format' => 'text'],
                ['key' => 'instrument_type', 'label' => 'Instrumen', 'format' => 'status'],
                ['key' => 'acquisition_cost', 'label' => 'Modal', 'format' => 'currency'],
                ['key' => 'current_value', 'label' => 'Nilai Kini', 'format' => 'currency'],
                ['key' => 'profit_loss', 'label' => 'Untung/Rugi', 'format' => 'currency'],
                ['key' => 'status', 'label' => 'Status', 'format' => 'status'],
            ],
            'details' => $details,
            'chart' => [],
        ];
    }
}

<?php

namespace App\Queries\Reports;

use App\Models\User;
use App\Queries\Dashboard\DashboardSummaryQuery;
use App\Queries\Dashboard\NetWorthQuery;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Carbon;

class NetWorthReportQuery
{
    public function __construct(
        private DashboardSummaryQuery $dashboardSummaryQuery,
        private NetWorthQuery $netWorthQuery,
    ) {}

    /** @param array{report_type: string, date_from: string, date_to: string, account_id: string|null, category_id: string|null, status: string|null} $filters
     * @return array<string, mixed>
     */
    public function get(User $user, array $filters, int $perPage = 15): array
    {
        $dashboard = $this->dashboardSummaryQuery->handle(
            $user,
            Carbon::parse($filters['date_to'])->startOfMonth(),
        );
        $netWorth = $this->netWorthQuery->calculate($user, $dashboard['summary']['totalBalance']);
        $components = [
            ['component' => 'Saldo akun', 'amount' => $netWorth['accountBalance'], 'effect' => 'positive'],
            ['component' => 'Investasi', 'amount' => $netWorth['investments'], 'effect' => 'positive'],
            ['component' => 'Aset', 'amount' => $netWorth['assets'], 'effect' => 'positive'],
            ['component' => 'Piutang', 'amount' => $netWorth['receivables'], 'effect' => 'positive'],
            ['component' => 'Utang', 'amount' => $netWorth['debts'], 'effect' => 'negative'],
        ];
        $page = Paginator::resolveCurrentPage();
        $details = new LengthAwarePaginator(
            array_slice($components, ($page - 1) * $perPage, $perPage),
            count($components),
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()],
        );

        return [
            'type' => 'net_worth',
            'title' => 'Laporan Kekayaan Bersih',
            'summary' => [
                'net_worth' => $netWorth['total'],
                'total_assets' => $netWorth['accountBalance'] + $netWorth['investments'] + $netWorth['assets'] + $netWorth['receivables'],
                'debts' => $netWorth['debts'],
            ],
            'columns' => [
                ['key' => 'component', 'label' => 'Komponen', 'format' => 'text'],
                ['key' => 'amount', 'label' => 'Nilai', 'format' => 'currency'],
                ['key' => 'effect', 'label' => 'Dampak', 'format' => 'status'],
            ],
            'details' => $details,
            'chart' => [],
        ];
    }
}

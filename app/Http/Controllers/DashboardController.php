<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardPeriodRequest;
use App\Models\User;
use App\Queries\Budgets\BudgetUsageQuery;
use App\Queries\Dashboard\DashboardSecondarySummaryQuery;
use App\Queries\Dashboard\DashboardSummaryQuery;
use App\Queries\Dashboard\NetWorthQuery;
use App\Queries\Dashboard\RecentTransactionQuery;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(
        DashboardPeriodRequest $request,
        DashboardSummaryQuery $summaryQuery,
        RecentTransactionQuery $recentTransactionQuery,
        BudgetUsageQuery $budgetUsageQuery,
        NetWorthQuery $netWorthQuery,
        DashboardSecondarySummaryQuery $secondarySummaryQuery,
    ): Response {
        /** @var User $user */
        $user = $request->user();
        $period = $request->period();
        $cycleRange = $user->financialCycleRange($period);
        $overview = $summaryQuery->handle($user, $period);

        return Inertia::render('dashboard/index', [
            'period' => [
                'value' => $period->format('Y-m'),
                'label' => $period->translatedFormat('F Y'),
                'previous' => $period->copy()->subMonth()->format('Y-m'),
                'next' => $period->copy()->addMonth()->format('Y-m'),
                'rangeLabel' => $cycleRange['label'],
                'startDate' => $cycleRange['start']->toDateString(),
                'endDate' => $cycleRange['end']->toDateString(),
            ],
            ...$overview,
            'recentTransactions' => $recentTransactionQuery->get($user),
            'budgets' => $budgetUsageQuery->get($user, $period),
            'netWorth' => $netWorthQuery->calculate(
                $user,
                $overview['summary']['totalBalance'],
            ),
            'secondary' => $secondarySummaryQuery->get($user),
            'isNewUser' => $overview['summary']['activeAccountCount'] === 0,
        ]);
    }
}

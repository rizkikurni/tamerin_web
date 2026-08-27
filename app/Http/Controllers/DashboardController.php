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
        $overview = $summaryQuery->handle($user, $period);

        return Inertia::render('dashboard/index', [
            'period' => [
                'value' => $period->format('Y-m'),
                'label' => $period->translatedFormat('F Y'),
                'previous' => $period->subMonth()->format('Y-m'),
                'next' => $period->addMonth()->format('Y-m'),
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

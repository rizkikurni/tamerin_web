<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexReportRequest;
use App\Models\User;
use App\Queries\Reports\FinancialReportQuery;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(
        IndexReportRequest $request,
        FinancialReportQuery $query,
    ): Response {
        /** @var User $user */
        $user = $request->user();
        $filters = $request->filters();
        $period = $user->currentFinancialPeriod();
        $cycleRange = $user->financialCycleRange($period);

        return Inertia::render('reports/index', [
            'report' => $query->get($user, $filters),
            'filters' => $filters,
            'reportOptions' => $query->reportOptions(),
            'filterOptions' => $query->filterOptions($user),
            'statusOptions' => $query->statusOptions($filters['report_type']),
            'financialCycle' => [
                'startDay' => $user->financialCycleStartDay(),
                'startDate' => $cycleRange['start']->toDateString(),
                'endDate' => $cycleRange['end']->toDateString(),
                'label' => $cycleRange['label'],
            ],
            'csrfToken' => csrf_token(),
        ]);
    }
}

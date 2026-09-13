<?php

namespace App\Http\Controllers;

use App\Enums\ExportFormat;
use App\Http\Requests\IndexExportAuditRequest;
use App\Models\ExportAudit;
use App\Models\User;
use App\Queries\Reports\ExportAuditIndexQuery;
use App\Queries\Reports\FinancialReportQuery;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ExportAuditController extends Controller
{
    public function index(
        IndexExportAuditRequest $request,
        ExportAuditIndexQuery $query,
        FinancialReportQuery $financialReportQuery,
    ): Response {
        Gate::authorize('viewAny', ExportAudit::class);

        /** @var User $user */
        $user = $request->user();
        $filters = $request->filters();

        return Inertia::render('reports/exports', [
            'exports' => $query->paginate($user, $filters),
            'filters' => $filters,
            'reportOptions' => $financialReportQuery->reportOptions(),
            'formatOptions' => [
                ['value' => ExportFormat::Pdf->value, 'label' => 'PDF'],
                ['value' => ExportFormat::Xlsx->value, 'label' => 'XLSX'],
            ],
        ]);
    }
}

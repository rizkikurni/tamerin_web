<?php

namespace App\Actions\Reports;

use App\Enums\ExportFormat;
use App\Enums\ExportReportType;
use App\Models\ExportAudit;
use App\Models\User;
use App\Queries\Reports\FinancialReportQuery;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use LogicException;

class GenerateReportExport
{
    public function __construct(
        private FinancialReportQuery $financialReportQuery,
        private PdfReportGenerator $pdfReportGenerator,
        private XlsxReportGenerator $xlsxReportGenerator,
    ) {}

    /** @param array{report_type: string, date_from: string, date_to: string, account_id: string|null, category_id: string|null, status: string|null} $filters */
    public function handle(User $user, ExportFormat $format, array $filters): GeneratedReportFile
    {
        $report = $this->financialReportQuery->get($user, $filters, 1);
        $details = $report['details'] ?? null;

        if (! $details instanceof LengthAwarePaginator) {
            throw new LogicException('Financial report details must be paginated.');
        }

        $rowCount = $details->total();

        if ($rowCount > 1) {
            $report = $this->financialReportQuery->get($user, $filters, $rowCount);
        }

        $fileName = $this->fileName(
            (string) ($report['title'] ?? 'laporan'),
            $filters['date_from'],
            $filters['date_to'],
            $format,
        );
        $generator = match ($format) {
            ExportFormat::Pdf => $this->pdfReportGenerator,
            ExportFormat::Xlsx => $this->xlsxReportGenerator,
        };
        $file = $generator->generate($report, $filters, $fileName);

        $audit = new ExportAudit([
            'report_type' => ExportReportType::from($filters['report_type']),
            'format' => $format,
            'filters_json' => $filters,
            'row_count' => $file->rowCount,
            'file_name' => $file->fileName,
            'generated_at' => now(),
        ]);
        $audit->user()->associate($user);
        $audit->save();

        return $file;
    }

    private function fileName(
        string $title,
        string $dateFrom,
        string $dateTo,
        ExportFormat $format,
    ): string {
        return Str::slug("{$title}-{$dateFrom}-{$dateTo}").".{$format->value}";
    }
}

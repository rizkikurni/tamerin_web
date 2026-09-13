<?php

namespace App\Actions\Reports;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Pagination\LengthAwarePaginator;
use LogicException;

class PdfReportGenerator implements ReportFileGenerator
{
    public function __construct(private ReportExportFormatter $formatter) {}

    /**
     * @param  array<string, mixed>  $report
     * @param  array<string, string|null>  $filters
     */
    public function generate(array $report, array $filters, string $fileName): GeneratedReportFile
    {
        $details = $report['details'] ?? null;

        if (! $details instanceof LengthAwarePaginator) {
            throw new LogicException('PDF report details must be paginated.');
        }

        $columns = $this->formatter->columns($report['columns'] ?? []);
        $rows = collect($details->items())
            ->map(fn (mixed $row): array => collect($columns)
                ->mapWithKeys(fn (array $column): array => [
                    $column['key'] => $this->formatter->displayValue(
                        is_array($row) ? data_get($row, $column['key']) : null,
                        $column['format'],
                    ),
                ])
                ->all())
            ->all();
        $summaryRows = $this->formatter->summaryRows($report['summary'] ?? []);

        $contents = Pdf::loadView('reports.pdf', [
            'title' => (string) ($report['title'] ?? 'Laporan Keuangan'),
            'period' => $filters['date_from'].' sampai '.$filters['date_to'],
            'generatedAt' => now()->translatedFormat('d M Y H:i'),
            'summaryRows' => $summaryRows,
            'columns' => $columns,
            'rows' => $rows,
        ])->setPaper('a4', 'landscape')->output();

        return new GeneratedReportFile(
            contents: $contents,
            mimeType: 'application/pdf',
            fileName: $fileName,
            rowCount: $details->total(),
        );
    }
}
